import { Card } from "@tremor/react";
import * as React from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";

const OtherTools = [
  {
    name: "Retirement Calculator",
    url: "/retirement",
  },
  {
    name: "Compound Interest Calculator",
    url: "/interest",
  },
  {
    name: "FIRE Calculator",
    url: "/fire",
  },
  {
    name: "Road to Millionaire Calculator",
    url: "/millionaire",
  },
];

export const OtherToolsCard: React.FC = () => {
  const location = useLocation();

  return (
    <Card className="w-full">
      <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong mb-4">
        Other Tools
      </h3>
      <div className="flex gap-4 flex-col">
        {OtherTools.map((tool) => {
          if (tool.url.toLowerCase() === location.pathname.toLowerCase()) {
            return null;
          }
          return (
            <Link
              key={tool.url}
              to={tool.url}
              className="text-tremor-content hover:text-tremor-content-strong dark:text-dark-tremor-default dark:hover:text-dark-tremor-content-strong underline decoration-dotted hover:decoration-solid"
            >
              {tool.name}
            </Link>
          );
        })}
      </div>
    </Card>
  );
};
