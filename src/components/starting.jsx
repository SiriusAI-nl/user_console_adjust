import React, { useState, useEffect } from "react";
import { SlClose } from "react-icons/sl";
import axios from "axios";
import * as XLSX from "xlsx";
import { marked } from "marked";
import MarkdownRenderer from "./MarkdownRenderer";
import KeywordChart from "./KeywordChart";
import GeminiChart from "./GeminiChart";

const keyword_api_url = import.meta.env.VITE_API_URL;

const Starting = ({ isPlanning, setIsPlanning }) => {
  const [loading, setLoading] = useState(false);
  const [keyWords, setKeyWords] = useState([]);
  const [geminiReport, setGeminiReport] = useState("");
  const [geminiChartData, setGeminiChartData] = useState([]);
  const [showGeminiReport, setShowGeminiReport] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showKeywordReport, setShowKeywordReport] = useState(false);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${keyword_api_url}/api/keyword_report`);
      setKeyWords(response.data.keyword_report || []);
    } catch (error) {
      console.error("Error fetching keyword report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeminiReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${keyword_api_url}/api/gemini_report`);
      const reportData = response.data.gemini_report;
      let formattedText = "";
      let chartData = [];

      if (reportData && Array.isArray(reportData.candidates)) {
        chartData = reportData.candidates
          .filter((candidate) => candidate.title && candidate.score)
          .map((candidate) => ({
            name: candidate.title,
            value: candidate.score,
          }));

        formattedText = reportData.candidates
          .map(
            (candidate) =>
              candidate.content?.parts?.map((part) => part.text).join("\n") ||
              ""
          )
          .join("\n\n");
      }

      setGeminiChartData(chartData);
      setGeminiReport(formattedText);
      setShowGeminiReport(true);
      setShowKeywordReport(false);
    } catch (error) {
      console.error("Error fetching Gemini Report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartResearch = () => {
    setIsResearching(true);
    fetchGeminiReport();
  };

  const handleShowKeywordReport = () => {
    setShowKeywordReport(true);
    fetchKeywords();
  };

  const downloadKeywordsExcel = () => {
    if (!Array.isArray(keyWords) || keyWords.length === 0) return;

    const wsData = [
      ["Keyword", "Search Volume", "Commercial Value"],
      ...keyWords.map((keyword) => [
        keyword.keyword,
        keyword.search_volume,
        keyword.commercial_value,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Keyword Report");
    XLSX.writeFile(wb, "Keyword_Report.xlsx");
  };

  const downloadGeminiReportWord = () => {
    const htmlContent = marked(geminiReport);
    const html = `<!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Marketing Report</title></head>
    <body>${htmlContent}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Gemini_Report.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    handleShowKeywordReport();
  }, []);

  return (
    <div className="flex h-full w-full py-6 px-6 border dark:border-white border-gray-700 hover:border-purple-500 rounded-lg bg-[#1F2937]">
      {!showGeminiReport && (
        <>
          {/* Left Panel */}
          {/* <div className="w-1/4 p-4">
            <div className="flex flex-col gap-4">
              <h1 className="dark:text-white text-gray-300 text-lg">
                {loading
                  ? "Marketing Research in Progress"
                  : "Starting Research"}
              </h1>
              <button
                onClick={handleShowKeywordReport}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded"
              >
                Show Keyword Report
              </button>
            </div>
          </div> */}

          {/* Right Panel for Keyword Report */}
          <div className="w-[100%] h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                {!loading && !isResearching && keyWords.length > 0 && (
                  <button
                    onClick={handleStartResearch}
                    className="bg-purple-500 hover:bg-purple-600 text-white font text-[14px] py-2 px-4 rounded"
                  >
                    Start Research
                  </button>
                )}
                {!loading && keyWords.length > 0 && (
                  <button
                    onClick={downloadKeywordsExcel}
                    className="bg-blue-500 hover:bg-blue-600 text-white font text-[14px] py-2 px-4 rounded"
                  >
                    Download Keyword Report (Excel)
                  </button>
                )}
              </div>
            </div>

            {loading && (
              <div className="flex items-center space-x-2 text-gray-300">
                <span className="text-[14px]">🔄</span>
                <span>Report in Progress...</span>
              </div>
            )}

            {showKeywordReport && !loading && (
              <div className="space-y-6 w[100%]">
                <div className="max-h-[305px] overflow-y-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="p-2 text-[13px]">Keyword</th>
                        <th className="p-2 text-center text-[13px]">
                          Search Volume
                        </th>
                        <th className="p-2 text-center text-[13px]">
                          Commercial Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {keyWords.map((keyword, index) => (
                        <tr key={index} className="border-t border-gray-600">
                          <td className="p-2 text-[12px]">{keyword.keyword}</td>
                          <td className="p-2 text-center text-[12px]">
                            {keyword.search_volume.toLocaleString()}
                          </td>
                          <td className="p-2 text-center text-[12px]">
                            {keyword.commercial_value.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="w-full">
                  <KeywordChart data={keyWords} />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Full Width Marketing Report */}
      {showGeminiReport && !loading && (
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-white text-xl">Marketing Report</h1>
              <button
                onClick={() => {
                  setShowGeminiReport(false);
                  setShowKeywordReport(true);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded"
              >
                Show Keyword Report
              </button>
            </div>
            <button
              onClick={downloadGeminiReportWord}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Download Gemini Report (Word)
            </button>
          </div>
          <div className="w-full max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="text-white text-sm leading-6 pr-4">
              <MarkdownRenderer markdownText={geminiReport} />
              {geminiChartData.length > 0 && (
                <GeminiChart data={geminiChartData} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Starting;
