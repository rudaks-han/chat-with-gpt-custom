import { OptionGroup } from "../core/options/option-group";

export const openAIOptions: OptionGroup = {
  id: "openai",
  options: [
    {
      id: "apiKey",
      defaultValue: "",
      displayOnSettingsScreen: "user",
      displayAsSeparateSection: true,
      renderProps: () => ({
        type: "password",
        label: "Your OpenAI API Key",
        placeholder: "sk-************************************************",
        description: (
          <>
            <p>
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                Find your API key here.
              </a>
            </p>
          </>
        ),
      }),
    },
  ],
};
