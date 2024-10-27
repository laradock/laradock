import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AiAssistantButton, useAiAssistant } from "@sista/ai-assistant-react";

const AiAssistant = () => {
  const { registerFunctions } = useAiAssistant();
  const history = useHistory();

  const navigateToPage = ({ page }) => {
    history.push(`/Porto/${page}`);
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
                  "docs/Intro/?page=get_started",

                  "docs/category/layers",
                  "docs/Layers/Layers Overview",
                  "docs/Layers/Containers Layer",
                  "docs/Layers/Ship Layer",

                  "docs/category/components",
                  "docs/Components/Components Overview",
                  "docs/category/main-components?page=main_components",
                  "docs/Components/Main Components Principles/Routes",
                  "docs/Components/Main Components Principles/Requests",
                  "docs/Components/Main Components Principles/Controllers",
                  "docs/Components/Main Components Principles/Actions",
                  "docs/Components/Main Components Principles/Tasks",
                  "docs/Components/Main Components Principles/Models",
                  "docs/Components/Main Components Principles/Views",
                  "docs/Components/Main Components Principles/Transformers",
                  "docs/Components/Main Components Principles/Exceptions",
                  "docs/Components/Main Components Principles/Sub-Actions",
                  "docs/Components/Optional Components",

                  "docs/Basics/Components Interaction",
                  "docs/Basics/Containers Dependencies",
                  "docs/Basics/Data Flow",

                  "docs/category/features",
                  "docs/Features/AI%20Driven Development",
                  "docs/Features/Monolithic to Microservices",

                  "docs/Quality Attributes",
                  "docs/Implementations",
                  "docs/Feedback",
                  "docs/Author",
                  "docs/Donations",
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
                  "The URL to navigate to. For 'Github' go to 'https://github.com/Mahmoudz/Porto'. For 'Sista' go to 'https://smart.sista.ai/?utm_source=docs_porto&utm_medium=ai_assistant&utm_campaign=user_request_for_navigation'.",
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
