# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.217.4/containers/javascript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 16, 14, 12, 16-bullseye, 14-bullseye, 12-bullseye, 16-buster, 14-buster, 12-buster
ARG VARIANT="16-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# Install Ruby for Jekyll
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends ruby-full build-essential

# Install Jekyll for node user
RUN echo '# Install Ruby Gems to ~/gems' >> /home/node/.bashrc && echo 'export GEM_HOME="$HOME/gems"' >> /home/node/.bashrc && echo 'export PATH="$HOME/gems/bin:$PATH"' >> /home/node/.bashrc
RUN gem install jekyll bundler