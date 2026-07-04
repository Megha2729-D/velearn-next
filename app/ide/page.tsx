"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./style.css";

const WANDBOX_API_URL = "https://wandbox.org/api/compile.json";

type Language =
    | "javascript"
    | "python"
    | "java"
    | "cpp"
    | "typescript"
    | "html"
    | "css";

const COMPILER_CONFIG: Record<Language, string | null> = {
    python: "cpython-3.13.8",
    java: "openjdk-jdk-22+36",
    cpp: "gcc-13.2.0",
    typescript: "typescript-5.6.2",
    javascript: "nodejs-20.17.0",
    html: null,
    css: null,
};

const JAVA_COMPILER_FALLBACKS = [
    "openjdk-jdk-22+36",
    "openjdk-jdk-21+35",
    "openjdk-latest",
];

const languageTemplates: Record<Language, string> = {
    javascript: `console.log("Hello from React Web!");`,

    html: `<!DOCTYPE html>
<html>
<head>
<title>HTML Preview</title>
</head>
<body>
<h1>Hello HTML!</h1>
<p>Edit and click Run</p>
</body>
</html>`,

    css: `body {
  background-color: #111;
  color: white;
  text-align: center;
  font-family: Arial;
}

h1 {
  color: #00ffcc;
}`,

    python: `print("Hello Python!")`,

    java: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello Java!");
    }
}`,

    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello C++!" << endl;
    return 0;
}`,

    typescript: `const msg: string = "Hello TypeScript";
console.log(msg);`,
};

interface JSExecutionResult {
    output: string;
    isError: boolean;
}

export default function IDEEditor() {
    const [scrolled, setScrolled] = useState<boolean>(false);
    const [selectedLanguage, setSelectedLanguage] =
        useState<Language>("javascript");
    const [code, setCode] = useState<string>(
        languageTemplates.javascript
    );

    const [inputData, setInputData] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const [fileName, setFileName] = useState<string>("main.js");
    const [exitCode, setExitCode] = useState<number | null>(null);
    const [execTime, setExecTime] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("Ready");

    const BASE_IMAGE_URL = "https://velearn-next.onrender.com/assets/images/";

    useEffect(() => {
        const savedLang =
            (localStorage.getItem(
                "velearn_last_saved_language"
            ) as Language) || "javascript";

        setSelectedLanguage(savedLang);

        const savedCode = localStorage.getItem(
            `velearn_code_${savedLang}`
        );

        setCode(savedCode || languageTemplates[savedLang]);
    }, []);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", onScroll, {
            passive: true,
        });

        return () =>
            window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        switch (selectedLanguage) {
            case "html":
                setFileName("index.html");
                break;
            case "css":
                setFileName("style.css");
                break;
            case "javascript":
                setFileName("script.js");
                break;
            case "python":
                setFileName("main.py");
                break;
            case "java":
                setFileName("Main.java");
                break;
            case "cpp":
                setFileName("main.cpp");
                break;
            case "typescript":
                setFileName("main.ts");
                break;
        }
    }, [selectedLanguage]);

    const executeLocalJS = (
        codeString: string
    ): Promise<JSExecutionResult> => {
        return new Promise((resolve) => {
            const logs: string[] = [];
            const originalLog = console.log;

            console.log = (...args: unknown[]) => {
                logs.push(
                    args
                        .map((arg) =>
                            typeof arg === "object"
                                ? JSON.stringify(arg)
                                : String(arg)
                        )
                        .join(" ")
                );
            };

            try {
                eval(codeString);

                resolve({
                    output: logs.join("\n") || "Success (No Output)",
                    isError: false,
                });
            } catch (error) {
                resolve({
                    output:
                        "Error: " +
                        (error instanceof Error
                            ? error.message
                            : String(error)),
                    isError: true,
                });
            } finally {
                console.log = originalLog;
            }
        });
    };

    // ---------------------------
    // Run Code
    // ---------------------------
    const runCode = async (): Promise<void> => {
        if (!code.trim()) {
            alert("Please write some code first.");
            return;
        }

        const startTime = performance.now();

        setIsRunning(true);
        setStatus("Running...");
        setOutput("🚀 Running...");
        setIsError(false);
        setExitCode(null);
        setExecTime(null);

        try {
            // ---------------------------
            // Local JavaScript
            // ---------------------------
            if (selectedLanguage === "javascript") {
                const result = await executeLocalJS(code);

                const endTime = performance.now();

                setOutput(result.output);
                setIsError(result.isError);
                setExecTime(
                    ((endTime - startTime) / 1000).toFixed(2) + "s"
                );
                setExitCode(result.isError ? 1 : 0);
                setStatus(result.isError ? "Error" : "Success");

                return;
            }

            // ---------------------------
            // Other Languages (Wandbox)
            // ---------------------------
            const compilers =
                selectedLanguage === "java"
                    ? JAVA_COMPILER_FALLBACKS
                    : [COMPILER_CONFIG[selectedLanguage]].filter(
                        (compiler): compiler is string => compiler !== null
                    );

            let lastError: string | null = null;

            let processCodeForWandbox = code;

            if (selectedLanguage === "java") {
                processCodeForWandbox =
                    processCodeForWandbox.replace(
                        /public\s+class/g,
                        "class"
                    );
            }

            for (const compiler of compilers) {
                const response = await fetch(WANDBOX_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code: processCodeForWandbox,
                        compiler,
                        stdin: inputData,
                        save: false,
                    }),
                });

                const text = await response.text();

                if (!response.ok) {
                    lastError = text;
                    continue;
                }

                const data: {
                    status?: string | number;
                    program_output?: string;
                    program_message?: string;
                    compiler_error?: string;
                } = JSON.parse(text);

                const endTime = performance.now();

                if (data.status === "0" || data.status === 0) {
                    setOutput(
                        data.program_output ||
                        data.program_message ||
                        "Success (No Output)"
                    );

                    setIsError(false);
                    setExitCode(0);
                    setStatus("Success");
                } else {
                    setOutput(
                        data.program_message ||
                        data.compiler_error ||
                        "Execution Error"
                    );

                    setIsError(true);
                    setExitCode(1);
                    setStatus("Error");
                }

                setExecTime(
                    ((endTime - startTime) / 1000).toFixed(2) + "s"
                );

                return;
            }

            throw new Error(lastError || "All compilers failed");
        } catch (error: unknown) {
            const endTime = performance.now();

            setOutput(
                "❌ " +
                (error instanceof Error
                    ? error.message
                    : "Unknown error")
            );

            setIsError(true);
            setExitCode(1);
            setExecTime(
                ((endTime - startTime) / 1000).toFixed(2) + "s"
            );
            setStatus("Error");
        } finally {
            setIsRunning(false);
        }
    };

    const handleLanguageChange = (lang: Language): void => {
        setSelectedLanguage(lang);

        const savedCode = localStorage.getItem(
            `velearn_code_${lang}`
        );

        setCode(savedCode || languageTemplates[lang]);
        setOutput("");
        setInputData("");
        setStatus("Ready");
        setExitCode(null);
        setExecTime(null);
    };

    const handleDownload = (): void => {
        const blob = new Blob([code], {
            type: "text/plain",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    };

    const handleSave = (): void => {
        localStorage.setItem(
            `velearn_code_${selectedLanguage}`,
            code
        );

        localStorage.setItem(
            "velearn_last_saved_language",
            selectedLanguage
        );

        alert(
            `Code saved locally for ${selectedLanguage}!`
        );
    };

    const handleShare = async (): Promise<void> => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My ${selectedLanguage} snippet`,
                    text: code,
                });
            } catch (err) {
                console.error(
                    "Share failed:",
                    err instanceof Error
                        ? err.message
                        : err
                );
            }
        } else {
            await navigator.clipboard.writeText(code);
            alert("Code copied to clipboard!");
        }
    };

    const clearOutput = (): void => {
        setOutput("");
        setExitCode(null);
        setExecTime(null);
        setStatus("Ready");
        setIsError(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div className={`ide_header ${scrolled ? "scrolled" : ""}`}>
                <div className="row w-100 m-auto">
                    <div className="col-lg-4">
                        <div
                            className="ide_header_icon"
                            style={{ display: "flex", gap: 20 }}
                        >
                            <button>
                                <Image
                                    src={`${BASE_IMAGE_URL}ide/new-file.png`}
                                    alt=""
                                    height={90}
                                    width={90}
                                />
                                <br />
                                New File
                            </button>
                            <button>
                                <Image
                                    src={`${BASE_IMAGE_URL}ide/upload.png`}
                                    alt=""
                                    height={90}
                                    width={90}
                                />
                                <br />
                                Upload File
                            </button>
                            <div className="d-flex justify-content-center align-items-center">
                                <div className="select_wrapper">
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) =>
                                            handleLanguageChange(e.target.value as Language)
                                        }
                                    >
                                        {/* <option value="html">HTML</option>
                                        <option value="css">CSS</option> */}
                                        <option value="javascript">
                                            JavaScript
                                        </option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                        <option value="typescript">
                                            TypeScript
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8 d-flex justify-content-center justify-content-lg-end align-items-center">
                        <div className="ide_header_right">
                            <button onClick={runCode} disabled={isRunning}>
                                {" "}
                                <i className="bi bi-caret-right-fill"></i>{" "}
                                Run{" "}
                            </button>
                            <button onClick={handleShare}>
                                <i className="bi bi-share-fill"></i> Share
                            </button>
                            <button onClick={handleSave}>
                                <i className="bi bi-floppy"></i> Save
                            </button>
                            <button onClick={handleDownload}>
                                <i className="bi bi-download"></i> Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ide_body">
                <div className="ide_filename">{fileName}</div>
                {/* Code Editor */}
                <div className="row w-100 m-auto">
                    <div className="col-lg-6 px-0">
                        <textarea
                            className="ide_left_editor"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div className="col-lg-6 output_container px-0">
                        <div className="output_header">
                            <div className="output_left">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                                <span className="running_text">
                                    {selectedLanguage.toUpperCase()} | {status}
                                </span>
                            </div>

                            <div className="output_center">Output</div>
                            <div className="output_right"></div>
                        </div>

                        {/* Always visible Input Box */}
                        <div
                            style={{
                                borderBottom: "1px solid #333",
                                padding: "10px",
                                background: "#1e1e1e",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    color: "#aaa",
                                    marginBottom: "5px",
                                }}
                            >
                                Standard Input (stdin):
                            </div>
                            <textarea
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                                placeholder="Enter input for your program here (e.g. '7' for the Scanner)..."
                                style={{
                                    height: "80px",
                                    width: "100%",
                                    padding: "10px",
                                    background: "#f8f9fa",
                                    color: "#000",
                                    resize: "vertical",
                                    borderRadius: "4px",
                                    border: "none",
                                    outline: "none",
                                }}
                            />
                        </div>

                        {/* Output */}
                        <div
                            className="ide_right_output_inner"
                            style={{ padding: "10px" }}
                        >
                            <pre
                                style={{
                                    color: isError ? "red" : "#ffffff",
                                    margin: 0,
                                }}
                            >
                                {output ||
                                    "> Ready to execute. Output will appear here..."}
                            </pre>
                        </div>
                        {(selectedLanguage === "html" ||
                            selectedLanguage === "css") && (
                                <div style={{ marginTop: "20px" }}>
                                    <iframe
                                        id="previewFrame"
                                        title="preview"
                                        style={{
                                            width: "100%",
                                            height: "300px",
                                            background: "#fff",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </div>
                            )}
                    </div>
                    <div className="col-12 px-0">
                        <div className="ide_bottom_bar">
                            <div>
                                {selectedLanguage.toUpperCase()}
                                {exitCode !== null &&
                                    ` | Exit Code: ${exitCode}`}
                                {execTime && ` | Executed in: ${execTime}`}
                            </div>

                            <button onClick={clearOutput}>Clear</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

