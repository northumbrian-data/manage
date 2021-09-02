import { ButtonGroup } from "@material-ui/core";
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { BaseIconButton } from "@gliff-ai/style";
import {imgSrc} from "@/index"

const tooltips = {
  projects: {
    name: "Projects",
    icon: imgSrc("projects"),
  },
  team: {
    name: "Team members",
    icon: imgSrc("team"),
  },
  collaborators: {
    name: "External collaborators",
    icon: imgSrc("team"),
  },
};

interface Props {
  page: "team" | "projects" | "collaborators";
}

export function PageSelector(props: Props): ReactElement {
  const navigate = useNavigate();
  // TODO use Link here to wrap the buttons
  return (
    <ButtonGroup>
      <BaseIconButton
        tooltip={tooltips.projects}
        fill={props.page === "projects"}
        onClick={() => {
          navigate("../projects");
        }}
      />
      <BaseIconButton
        tooltip={tooltips.team}
        fill={props.page === "team"}
        onClick={() => {
          navigate("../team");
        }}
      />
      <BaseIconButton
        tooltip={tooltips.collaborators}
        fill={props.page === "collaborators"}
        onClick={() => {
          navigate("../collaborators");
        }}
      />
    </ButtonGroup>
  );
}
