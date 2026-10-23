//! Pictures for a plugin, made smaller on the computer without any LLM:
//! scaled down to what the readers need at most, stripped of metadata and
//! colour profiles, compressed as far as PNG goes (oxipng), never
//! interlaced (PaperPaw's decoder reads no interlaced PNGs). What is done
//! is the person's choice, per picture (see `Mode`); the original stays
//! with the project, the plugin gets this one.

use std::io::Cursor;

use base64::Engine;
use image::{DynamicImage, GenericImageView, ImageReader, imageops::FilterType};
use serde::{Deserialize, Serialize};

/// What becomes of a picture, as the person chose in the files drawer.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Mode {
    /// The picture as it is.
    Keep,
    /// Smaller, its colours kept.
    SmallerColour,
    /// Smaller, 16 grays: a 4-bit grayscale PNG (the reader dithers).
    SmallerGrays,
}

/// A picture made, and what it is now.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Made {
    pub png: Vec<u8>,
    pub width: u32,
    pub height: u32,
}

/// What a picture is, for the check before sending (larger than needed?
/// in colour?).
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Info {
    pub width: u32,
    pub height: u32,
    pub bytes: usize,
    /// Whether it has colours other than grays.
    pub colour: bool,
}

fn decode(bytes: &[u8]) -> Result<DynamicImage, String> {
    ImageReader::new(Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|e| e.to_string())?
        .decode()
        .map_err(|e| format!("not a picture the workshop reads: {e}"))
}

/// Whether `image` has colours other than grays (a little tolerance).
fn has_colour(image: &DynamicImage) -> bool {
    image.to_rgb8().pixels().any(|p| {
        let [r, g, b] = p.0;
        r.abs_diff(g) > 8 || g.abs_diff(b) > 8 || r.abs_diff(b) > 8
    })
}

pub fn info(bytes: &[u8]) -> Result<Info, String> {
    let image = decode(bytes)?;
    let (width, height) = image.dimensions();
    Ok(Info { width, height, bytes: bytes.len(), colour: has_colour(&image) })
}

/// `image` no larger than `max` (width, height), its sides kept in
/// proportion; turned the other way too, as a picture may be shown
/// across. Never larger than it was.
fn fit(image: DynamicImage, max: (u32, u32)) -> DynamicImage {
    let (w, h) = image.dimensions();
    let (long, short) = (max.0.max(max.1), max.0.min(max.1));
    let (bound_w, bound_h) = if w >= h { (long, short) } else { (short, long) };
    if w <= bound_w && h <= bound_h {
        return image;
    }
    image.resize(bound_w, bound_h, FilterType::Lanczos3)
}

/// 16 grays over white, packed as a 4-bit grayscale PNG.
fn grays_png(image: &DynamicImage) -> Result<Vec<u8>, String> {
    let (w, h) = image.dimensions();
    let rgba = image.to_rgba8();
    let row = (w as usize).div_ceil(2);
    let mut packed = vec![0u8; row * h as usize];
    for (x, y, p) in rgba.enumerate_pixels() {
        let [r, g, b, a] = p.0;
        // The eye's weights; transparent parts over white, as the reader shows them.
        let luma = (u32::from(r) * 299 + u32::from(g) * 587 + u32::from(b) * 114) / 1000;
        let over = (luma * u32::from(a) + 255 * (255 - u32::from(a))) / 255;
        let level = ((over * 15 + 127) / 255) as u8;
        let at = y as usize * row + x as usize / 2;
        packed[at] |= if x % 2 == 0 { level << 4 } else { level };
    }
    let mut out = Vec::new();
    let mut encoder = png::Encoder::new(&mut out, w, h);
    encoder.set_color(png::ColorType::Grayscale);
    encoder.set_depth(png::BitDepth::Four);
    let mut writer = encoder.write_header().map_err(|e| e.to_string())?;
    writer.write_image_data(&packed).map_err(|e| e.to_string())?;
    writer.finish().map_err(|e| e.to_string())?;
    Ok(out)
}

fn colour_png(image: &DynamicImage) -> Result<Vec<u8>, String> {
    let mut out = Vec::new();
    image
        .write_to(&mut Cursor::new(&mut out), image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    Ok(out)
}

/// As small as PNG goes: every chunk but the image's own dropped, no
/// interlacing, the strongest deflate.
fn squeeze(png: &[u8]) -> Result<Vec<u8>, String> {
    let mut options = oxipng::Options::from_preset(6);
    options.strip = oxipng::StripChunks::All;
    options.interlace = Some(oxipng::Interlacing::None);
    oxipng::optimize_from_memory(png, &options).map_err(|e| e.to_string())
}

/// The picture `bytes` made as `mode` says, no larger than `max`.
pub fn make(bytes: &[u8], mode: Mode, max: (u32, u32)) -> Result<Made, String> {
    let image = decode(bytes)?;
    if mode == Mode::Keep {
        let (width, height) = image.dimensions();
        return Ok(Made { png: bytes.to_vec(), width, height });
    }
    let image = fit(image, max);
    let (width, height) = image.dimensions();
    let png = match mode {
        Mode::SmallerGrays => grays_png(&image)?,
        _ => colour_png(&image)?,
    };
    Ok(Made { png: squeeze(&png)?, width, height })
}

fn b64() -> base64::engine::GeneralPurpose {
    base64::engine::general_purpose::STANDARD
}

/// The picture in base64 made as `mode` says; the result in base64 with
/// its size. Runs off the window's thread: compressing takes a moment.
#[tauri::command]
pub async fn picture_make(base64: String, mode: Mode, max_width: u32, max_height: u32) -> Result<(String, u32, u32), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let bytes = b64().decode(base64).map_err(|e| e.to_string())?;
        let made = make(&bytes, mode, (max_width, max_height))?;
        Ok((b64().encode(made.png), made.width, made.height))
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn picture_info(base64: String) -> Result<Info, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let bytes = b64().decode(base64).map_err(|e| e.to_string())?;
        info(&bytes)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A picture `w`×`h`, a colour gradient, with metadata, as a camera's
    /// would be (here: a text chunk).
    fn photo(w: u32, h: u32) -> Vec<u8> {
        let image = image::RgbImage::from_fn(w, h, |x, y| image::Rgb([(x * 255 / w) as u8, (y * 255 / h) as u8, 128]));
        let mut out = Vec::new();
        let mut encoder = png::Encoder::new(&mut out, w, h);
        encoder.set_color(png::ColorType::Rgb);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.add_text_chunk("Comment".into(), "taken with a camera".into()).unwrap();
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(image.as_raw()).unwrap();
        writer.finish().unwrap();
        out
    }

    fn header(png: &[u8]) -> (u32, u32, u8, u8, u8) {
        let be = |i: usize| u32::from_be_bytes(png[i..i + 4].try_into().unwrap());
        (be(16), be(20), png[24], png[25], png[28])
    }

    #[test]
    fn grays_are_a_small_4_bit_grayscale_png_within_the_panel() {
        let original = photo(2000, 3000);
        let made = make(&original, Mode::SmallerGrays, (480, 800)).unwrap();
        let (w, h, depth, color, interlace) = header(&made.png);
        assert_eq!((w, h), (made.width, made.height));
        assert!(w <= 480 && h <= 800, "{w}x{h}");
        assert_eq!((depth, color, interlace), (4, 0, 0), "4-bit gray, not interlaced");
        assert!(!made.png.windows(4).any(|c| c == b"tEXt"), "metadata stripped");
        assert!(made.png.len() < original.len() / 10);
        assert!(!info(&made.png).unwrap().colour);
    }

    #[test]
    fn colour_is_kept_when_asked_and_made_smaller() {
        let original = photo(1600, 1200);
        let made = make(&original, Mode::SmallerColour, (480, 800)).unwrap();
        // Across: the longer side may take the panel's longer side (800x480).
        assert_eq!((made.width, made.height), (640, 480));
        assert!(info(&made.png).unwrap().colour);
        assert!(!made.png.windows(4).any(|c| c == b"tEXt"));
        assert_eq!(header(&made.png).4, 0, "not interlaced");
    }

    #[test]
    fn keep_leaves_it_as_it_is_and_small_pictures_are_not_made_larger() {
        let original = photo(100, 50);
        assert_eq!(make(&original, Mode::Keep, (480, 800)).unwrap().png, original);
        let made = make(&original, Mode::SmallerGrays, (480, 800)).unwrap();
        assert_eq!((made.width, made.height), (100, 50));
    }

    #[test]
    fn transparent_parts_become_white() {
        let image = DynamicImage::ImageRgba8(image::RgbaImage::from_pixel(4, 4, image::Rgba([0, 0, 0, 0])));
        let png = grays_png(&image).unwrap();
        let decoded = decode(&png).unwrap().to_luma8();
        assert!(decoded.pixels().all(|p| p.0[0] == 255));
    }

    #[test]
    fn what_is_not_a_picture_is_said() {
        assert!(make(b"not a picture", Mode::SmallerGrays, (480, 800)).is_err());
    }
}
