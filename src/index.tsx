import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  AppBar,
  CssBaseline,
  Grid,
  Toolbar,
  ThemeProvider,
} from "@material-ui/core";
import { makeStyles, StylesProvider } from "@material-ui/core/styles";
import { theme, generateClassName, Logo } from "@gliff-ai/style";

import { initApiRequest, ServiceFunctions } from "@/api";
import { TeamView } from "@/views/TeamView";
import { ProjectsView } from "@/views/ProjectsView";
import { TrustedServiceView } from "./views/TrustedServiceView";

import { useAuth } from "@/hooks/use-auth";
import { CollaboratorsView } from "@/views/CollaboratorsView";

import type { Services } from "@/api";
import { PageSelector } from "./components/PageSelector";
import { Progress, User } from "./interfaces";
import { setStateIfMounted } from "./helpers";

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
  createTrustedService: "POST /trusted_service",
  getTrustedServices: "GET /trusted_service",
  getCollectionsMembers: "GET /projects/collectionsmembers",
  removeFromProject: "POST /user/delete/collaborator",
} as Services;

interface Props {
  apiUrl: string;
  services?: Readonly<typeof defaultServices>;
  user?: User; // Optional mock user
  showAppBar: boolean;
  launchCurateCallback?: (projectUid: string) => void;
  launchAuditCallback?: (projectUid: string) => void;
  getAnnotationProgress: (username: string) => Promise<Progress>;
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
  const [services, setServices] = useState<ServiceFunctions | null>(null);
  const auth = useAuth();

  const isMounted = useRef(false);

  useEffect(() => {
    // runs at mount
    isMounted.current = true;
    return () => {
      // runs at dismount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // This loads all the services we use, which are either API requests, or functions that allow us to mock etc.
    const newServices = initApiRequest(props.apiUrl, props.services);
    setStateIfMounted(newServices, setServices, isMounted.current);
  }, [props.apiUrl, props.services, isMounted]);

  useEffect(() => {
    if (!auth) return;
    // Autologin if we've been passed a login
    if (props.user) {
      auth?.saveUser(props.user);
    }
  }, [auth, props.user]);

  if (!auth?.user) return null;

  const appbar = props.showAppBar && (
    <AppBar position="fixed" className={classes.appBar} elevation={0}>
      <Toolbar>
        <Grid container direction="row">
          <Grid item className={classes.logo}>
            <Logo />
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
        <div
          style={{
            marginTop: props.showAppBar ? "108px" : "20px",
            display: "flex",
          }}
        >
          <PageSelector user={auth.user} />
          <Routes>
            <Route path="/">
              <Navigate to="projects" />
            </Route>
            <Route path="team" element={<TeamView services={services} />} />
            <Route
              path="services"
              element={<TrustedServiceView services={services} />}
            />
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
                  getAnnotationProgress={props.getAnnotationProgress}
                />
              }
            />
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
