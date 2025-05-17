import React from "react";
import OriginalLayout from "@theme-original/Layout";
import { AiAssistantProvider, AiAssistantButton } from "@sista/ai-assistant-react";
const config = require("../config");

const Layout = (props) => {
  return (
    <OriginalLayout {...props}>
      {props.children}
      <AiAssistantButton />
    </OriginalLayout>
  );
};

const Providers = (props) => {
  return (
    <AiAssistantProvider
      debug={true}
      apiKey={config.SISTA_AI_API_KEY}
      // apiKey={config.SISTA_AI_API_KEY_DEV}
      // apiUrl="http://localhost:3077"
    >
      <Layout {...props} />
    </AiAssistantProvider>
  );
};

export default Providers;
