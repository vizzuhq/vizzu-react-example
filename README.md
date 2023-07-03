> Note: This solution works from React 16.8 due to the use of built-in hooks.

# Getting Started with Vizzu in React

If you're here for a description, please see the docs on [Github Page](https://vizzuhq.github.io/vizzu-react-example/)

## Running the example on your machine

1. Clone the repository
2. Run `npm install`
3. Run `npm start`
4. Open http://localhost:3000/ on your local machine

## Running the docs site on your machine

### With a devcontainer in VSCode

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install the [Remote \- Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension in VSCode
3. Clone the repository and open the folder in VSCode
4. From the Command Palette (Ctrl+Shift+P), choose "Remote-Containers: Rebuild and Reopen in Container".  
   This will create a docker image based on the contents of the .devcontainer folder and install all necessary dependencies.
5. In your embedded terminal:
   ```bash
   cd docs
   bundle install
   bundle exec jekyll serve
   ```
6. Open `http://localhost:4000` in your browser

### Without Docker

1. Follow the Prerequisites section of this [GitHub article](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll#prerequisites) to set up Jekyll locally
2. Clone this repository and open it in your terminal
3. Navigate to the docs folder and serve it in Jekyll
   ```bash
   cd docs
   bundle install
   bundle exec jekyll serve
   ```
4. Open `http://localhost:4000` in your browser
