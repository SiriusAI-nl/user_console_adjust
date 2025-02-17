// MarkdownRenderer.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({ markdownText }) => {
  return (
    <div className="prose prose-sm p-2 pb-[30px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdownText}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
