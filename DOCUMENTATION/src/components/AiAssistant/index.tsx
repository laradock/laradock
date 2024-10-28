import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AiAssistantButton, useAiAssistant } from "@sista/ai-assistant-react";

const AiAssistant = () => {
  const { registerFunctions } = useAiAssistant();
  const history = useHistory();

  const navigateToPage = ({ page }) => {
    history.push(`/${page}`);
  };

  const navigateToExternalUrl = ({ url }) => {
    window.location.href = url;
  };

  const goToNextPage = () => {
    const nextPageButton = document.querySelector(
      "a.pagination-nav__link.pagination-nav__link--next"
    ) as HTMLElement;
    if (nextPageButton) {
      nextPageButton.click();
    }
  };

  const goToPreviousPage = () => {
    const previousPageButton = document.querySelector(
      "a.pagination-nav__link.pagination-nav__link--prev"
    ) as HTMLElement;
    if (previousPageButton) {
      previousPageButton.click();
    }
  };

  const switchTheme = () => {
    const themeToggle = document.querySelector(
      'button[title^="Switch between dark and light mode"][class*="ColorModeToggle-styles-module"]'
    ) as HTMLElement;
    if (themeToggle) {
      themeToggle.click();
    }
  };

  useEffect(() => {
    const aiFunctions = [
      {
        function: {
          handler: navigateToPage,
          description:
            "Go to a specific page. Navigate to a page. Internal pages. This is what the user often wants, when asking for navigation. Each page contains info about the specific topic, as you can tell from the page name.",
          parameters: {
            type: "object",
            properties: {
              page: {
                type: "string",
                description: "The page to navigate to.",
                enum: [
                  "/?page=home",
                  "docs/intro/",

                  "docs/getting-started",
                  "docs/usage",
                  "docs/help",
                  "docs/related-projects",
                  "docs/contributing",
                ],
              },
            },
            required: ["page"],
          },
        },
      },
      {
        function: {
          handler: navigateToExternalUrl,
          description: "Navigate to an external URL.",
          parameters: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description:
                  "The URL to navigate to. For 'Github' go to 'https://github.com/laradock/laradock'. For 'Sista' go to 'https://smart.sista.ai/?utm_source=docs_laradock&utm_medium=ai_assistant&utm_campaign=user_request_for_navigation'.",
              },
            },
            required: ["url"],
          },
        },
      },
      {
        function: {
          handler: goToNextPage,
          description:
            "Navigate to the next page. Go to the next page. Click on the next page. Next. Next Page.",
        },
      },
      {
        function: {
          handler: goToPreviousPage,
          description:
            "Navigate to the previous page. Go to the previous page. Click on the previous page. Previous. Previous Page.",
        },
      },
      {
        function: {
          handler: switchTheme,
          description:
            "Turn On / Off the light. Change theme color. Switches between dark and light modes. Toggle the theme.",
        },
      },
    ];

    if (registerFunctions) {
      registerFunctions(aiFunctions);
    }
  }, [registerFunctions]);

  return <AiAssistantButton />;
};

export default AiAssistant;
