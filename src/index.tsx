import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  AppBar,
  CssBaseline,
  Grid,
  Toolbar,
  ThemeProvider,
} from "@material-ui/core";
import { makeStyles, StylesProvider } from "@material-ui/core/styles";
import { theme, generateClassName } from "@gliff-ai/style";

import { initApiRequest } from "@/api";
import { TeamView } from "@/views/TeamView";
import { ProjectsView } from "@/views/ProjectsView";
import { useAuth } from "@/hooks/use-auth";
import { CollaboratorsView } from "@/views/CollaboratorsView";

import type { Services } from "@/api";

type User = {
  email: string;
  authToken: string;
};

export const imgSrc = (src: string, type = "svg"): string =>
  new URL(`/src/assets/${src}.${type}`, import.meta.url).href;

const defaultServices = {
  queryTeam: "GET /team",
  loginUser: "POST /user/login",
  inviteUser: "POST /user/invite",
  inviteCollaborator: "POST /user/invite/collaborator",
  getProjects: "GET /projects",
  getProject: "GET /project", // TODO: Support named params for GET? Body works tho...
  getCollaboratorProject: "GET /team/collaboratorprojects",
  createProject: "POST /projects",
  inviteToProject: "POST /projects/invite",
} as Services;

interface Props {
  apiUrl: string;
  services?: Readonly<typeof defaultServices>;
  user?: User; // Optional mock user
  showAppBar: boolean;
  launchCurateCallback?: (projectUid: string) => void;
  launchAuditCallback?: (projectUid: string) => void;
}

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: "white",
    height: "90px",
    paddingTop: "9px",
  },
  logo: {
    marginBottom: "5px",
    marginTop: "7px",
  },
}));

export function UserInterface(props: Props): JSX.Element {
  const classes = useStyles();

  const auth = useAuth();

  // This loads all the services we use, which are either API requests, or functions that allow us to mock etc.
  const services = initApiRequest(props.apiUrl, props.services);

  useEffect(() => {
    if (!auth?.user && props.user) {
      // Autologin if we've been passed a login
      const { email, authToken } = props.user;
      auth.saveUser(email, authToken);
    }
  });

  const appbar = props.showAppBar && (
    <AppBar position="fixed" className={classes.appBar} elevation={0}>
      <Toolbar>
        <Grid container direction="row">
          <Grid item className={classes.logo}>
            <img
              src={imgSrc("gliff-master-black")}
              width="79px"
              height="60px"
              alt="gliff logo"
            />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );

  return (
    <StylesProvider generateClassName={generateClassName("manage")}>
      <ThemeProvider theme={theme}>
        {appbar}
        <CssBaseline />
        <div style={{ marginTop: props.showAppBar ? "108px" : "20px" }}>
          <Routes>
            <Route path="//*">
              <Route path="/">
                <Navigate to="projects" />
              </Route>
              <Route path="team" element={<TeamView services={services} />} />
              <Route
                path="collaborators"
                element={<CollaboratorsView services={services} />}
              />
              <Route
                path="projects"
                element={
                  <ProjectsView
                    services={services}
                    launchCurateCallback={props.launchCurateCallback}
                    launchAuditCallback={props.launchAuditCallback}
                  />
                }
              />
            </Route>
          </Routes>
        </div>
      </ThemeProvider>
    </StylesProvider>
  );
}

UserInterface.defaultProps = {
  services: defaultServices,
  user: undefined as User,
  launchCurateCallback: undefined,
  launchAuditCallback: undefined,
};

export type { Services };
export { ProvideAuth } from "@/hooks/use-auth";
