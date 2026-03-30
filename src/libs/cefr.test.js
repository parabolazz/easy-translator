import { maybeAnnotateTranslatedText } from "./cefr";

describe("maybeAnnotateTranslatedText", () => {
  test("keeps non-English translation unchanged", async () => {
    const annotate = jest.fn(async () => "ANNOTATED");

    const result = await maybeAnnotateTranslatedText({
      translatedText: "这是翻译结果",
      targetLang: "zh-CN",
      cefrSetting: { enabled: true, level: 2 },
      annotate,
    });

    expect(result).toBe("这是翻译结果");
    expect(annotate).not.toHaveBeenCalled();
  });

  test("annotates when translation target language is English", async () => {
    const annotate = jest.fn(async () => "annotated english text");

    const result = await maybeAnnotateTranslatedText({
      translatedText: "translated english text",
      targetLang: "en",
      cefrSetting: { enabled: true, level: 3 },
      annotate,
    });

    expect(result).toBe("annotated english text");
    expect(annotate).toHaveBeenCalledWith("translated english text", 3);
  });
});
