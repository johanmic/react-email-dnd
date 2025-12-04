// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const path = require("path")
const webpack = require("webpack")
const lightCodeTheme = require("prism-react-renderer/themes/github")
const darkCodeTheme = require("prism-react-renderer/themes/dracula")

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "React Email DnD",
  tagline: "React Email Drag-and-Drop",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://johanmic.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "johanmic",
  projectName: "react-email-dnd",

  deploymentBranch: "gh-pages",
  trailingSlash: false,

  onBrokenLinks: "throw",

  stylesheets: [
    "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap",
  ],

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/johanmic/react-email-dnd/tree/main/docs",
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "React Email DnD",
        logo: {
          alt: "React Email DnD Logo",
          src: "img/logo-transparent.png",
          // srcDark: "img/whitelogo.png",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Docs",
          },
          {
            href: "https://github.com/johanmic/react-email-dnd",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Find me on",
            items: [
              {
                label: "Bluesky",
                href: "https://bsky.app/profile/jojomic.bsky.social",
              },
              {
                label: "X",
                href: "https://x.com/jmickelin",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} React Email DnD.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  plugins: [
    "./src/config/tailwind-config.js",
    function editorAliasPlugin() {
      return {
        name: "editor-alias",
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /\.m?js$/,
                  resolve: {
                    fullySpecified: false,
                  },
                },
              ],
            },
            resolve: {
              alias: {
                "@react-email-dnd/editor": path.resolve(
                  __dirname,
                  "../packages/editor/src"
                ),
                "@react-email/components": path.resolve(
                  __dirname,
                  "../packages/editor/node_modules/@react-email/components"
                ),
                "react": path.resolve(__dirname, "./node_modules/react"),
                "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
              },
            },
            plugins: [
              // Some editor bundles still expect a global React when transpiled.
              new webpack.ProvidePlugin({
                React: "react",
              }),
            ],
          };
        },
      };
    },
  ],
};

module.exports = config;
