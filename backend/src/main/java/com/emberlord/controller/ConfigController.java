package com.emberlord.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class ConfigController {

    @Autowired
    private Environment env;

    @GetMapping(value = "/api/env-config.js", produces = "application/javascript")
    public String getConfig() {
        String json = """
            {
                "LLM_PROVIDER":  "%s",
                "OLLAMA_API_URL": "%s",
                "OLLAMA_MODEL":  "%s",
                "OPENAI_API_KEY": "%s",
                "OPENAI_MODEL":  "%s",
                "GEMINI_API_KEY": "%s",
                "GEMINI_MODEL":  "%s",
                "GITHUB_TOKEN":  "%s",
                "GITHUB_MODEL":  "%s",
                "GITHUB_API_URL": "%s"
            }
            """.formatted(
                esc("llm.provider"),
                esc("llm.ollama.api-url"),
                esc("llm.ollama.model"),
                esc("llm.openai.api-key"),
                esc("llm.openai.model"),
                esc("llm.gemini.api-key"),
                esc("llm.gemini.model"),
                esc("llm.github.token"),
                esc("llm.github.model"),
                esc("llm.github.api-url")
            );

        return "const LOCAL_CONFIG = " + json + ";\nObject.assign(CONFIG, LOCAL_CONFIG);\n";
    }

    private String esc(String key) {
        String val = env.getProperty(key, "");
        return val.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
