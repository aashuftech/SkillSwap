import React from "react";
import { useParams } from "react-router-dom";
import CategoryPageTemplate from "../components/CategoryPageTemplate";
import { CATEGORY_PAGES } from "../data/categoryPages";

const slugToKey = {
  "web-development": "webDevelopment",
  "mobile-development": "mobileDevelopment",
  "ui-ux-design": "uiUxDesign",
  "graphic-design": "graphicDesign",
  "content-writing": "contentWriting",
  seo: "seo",
  "digital-marketing": "digitalMarketing",
  "data-science": "dataScience",
  "video-editing": "videoEditing",
  "language-exchange": "languageExchange",
  music: "music",
  others: "others",
};

export default function DynamicCategoryPage({ categoryKey }) {
  const params = useParams();
  const key = categoryKey || (params.slug ? slugToKey[params.slug] : null) || "others";
  const data = CATEGORY_PAGES[key] || CATEGORY_PAGES.others;

  return <CategoryPageTemplate data={data} />;
}
