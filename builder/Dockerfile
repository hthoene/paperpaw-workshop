# The builder (design 4.3): PaperPaw at a ref, its crates already compiled
# for the browser (wasm32) and the X4 (RISC-V), and the build API.
#
#   npm run builder-source -- --repo ../paperpaw --ref <ref>   (once, and for another ref)
#   docker compose up --build
#
# Builds run offline: every crate PaperPaw needs is in the image, and a
# plugin may name only the SDK (builder/project.mjs). The X4 Pro's builds
# (Xtensa, espup's toolchain) come later.
FROM node:24-bookworm-slim AS node

FROM rust:1.99-bookworm
COPY --from=node /usr/local/bin/node /usr/local/bin/node
RUN rustup target add wasm32-unknown-unknown riscv32imc-unknown-none-elf

# PaperPaw's source at the ref builder/paperpaw.json names.
COPY builder/paperpaw.tar /tmp/paperpaw.tar
COPY builder/web-plugins.patch /tmp/web-plugins.patch
RUN mkdir /paperpaw && tar -xf /tmp/paperpaw.tar -C /paperpaw && rm /tmp/paperpaw.tar \
    # Until the web shell takes plugins with code itself (set_plugins).
    && (grep -q "pub fn set_plugins" /paperpaw/shells/web/src/emulator.rs \
        || (cd /paperpaw && patch -p1 < /tmp/web-plugins.patch)) \
    && cargo install --locked --path /paperpaw/tools/sign --root /usr/local

WORKDIR /builder
COPY builder/project.mjs builder/server.mjs ./
COPY builder/sample.json ./
# The sample built once for each target: every crate compiled, the
# registry in the image. The lock file is PaperPaw's.
RUN mkdir -p /work/web /work/native /cache /builds \
    && cp /paperpaw/Cargo.lock /work/web/Cargo.lock && cp /paperpaw/Cargo.lock /work/native/Cargo.lock \
    && node server.mjs prepare sample.json

ENV CARGO_NET_OFFLINE=true
EXPOSE 8090
CMD ["node", "server.mjs"]
