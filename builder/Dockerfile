# The builder: PaperPaw at a ref, its crates already compiled
# for the browser (wasm32), the X4 (RISC-V) and the X4 Pro (Xtensa), and
# the build API.
#
#   npm run builder-source -- --repo ../paperpaw --ref <ref>   (once, and for another ref)
#   docker compose --profile code up --build --renew-anon-volumes
#
# Builds run offline: every crate PaperPaw needs is in the image, and a
# plugin may name only the SDK (builder/project.mjs).
#
# A plugin file runs only on firmware built by the same compiler (ADR
# 0024): the X4's is the Rust of this image (PaperPaw's
# rust-toolchain.toml), the X4 Pro's espup's `esp` toolchain of the
# versions in PaperPaw's shells/xteink/versions.env. The arguments below
# must name those; a build of the image stops if they do not.
FROM node:24-bookworm-slim AS node

# The exact release: rust:1.99 moves on to 1.99.1, whose files the
# firmware (1.99.0) would not run.
FROM rust:1.99.0-bookworm
ARG ESPUP_VERSION=0.18.0
ARG ESP_RUST_VERSION=1.97.0.0
ARG ESP_GCC_VERSION=14.2.0_20241119
COPY --from=node /usr/local/bin/node /usr/local/bin/node
RUN rustup target add wasm32-unknown-unknown riscv32imc-unknown-none-elf
# The X4 Pro's toolchain, before PaperPaw's source: it changes seldom.
RUN cargo install espup --version "$ESPUP_VERSION" --locked \
    && espup install --targets esp32s3 --toolchain-version "$ESP_RUST_VERSION" \
        --crosstool-toolchain-version "$ESP_GCC_VERSION" --export-file /usr/local/export-esp.sh \
    && rm -rf /usr/local/cargo/registry/src /usr/local/cargo/bin/espup

# PaperPaw's source at the ref builder/paperpaw.json names.
COPY builder/paperpaw.tar /tmp/paperpaw.tar
RUN mkdir /paperpaw && tar -xf /tmp/paperpaw.tar -C /paperpaw && rm /tmp/paperpaw.tar \
    # A PaperPaw whose web shell takes plugins with code (set_plugins).
    && grep -q "pub fn set_plugins" /paperpaw/shells/web/src/emulator.rs \
    && cargo install --locked --path /paperpaw/tools/sign --root /usr/local
# The toolchains must be the firmware's.
RUN grep -q "^channel = \"$(rustc --version | cut -d' ' -f2)\"" /paperpaw/shells/xteink/rust-toolchain.toml \
    && grep -qx "ESP_RUST_VERSION=$ESP_RUST_VERSION" /paperpaw/shells/xteink/versions.env \
    && grep -qx "ESP_GCC_VERSION=$ESP_GCC_VERSION" /paperpaw/shells/xteink/versions.env \
    && rustc +esp --version | grep -qF "($ESP_RUST_VERSION)"

# Builds run as a user of their own, who may write only where cargo
# works: the build's folders and cargo's home (its registry).
RUN useradd --system --uid 10001 --home-dir /work builder \
    && mkdir -p /work/web /work/native /cache /builds \
    && cp /paperpaw/Cargo.lock /work/web/Cargo.lock && cp /paperpaw/Cargo.lock /work/native/Cargo.lock \
    && chown -R builder /work /cache /builds /usr/local/cargo

WORKDIR /builder
COPY builder/project.mjs builder/server.mjs ./
COPY builder/sample.json builder/paperpaw.json ./
USER builder
# The sample built once for each target (the X4 Pro's `core` and `alloc`
# too): every crate compiled, the registry in the image. The lock file is
# PaperPaw's.
RUN node server.mjs prepare sample.json

ENV CARGO_NET_OFFLINE=true
EXPOSE 8090
CMD ["node", "server.mjs"]
