import { useState, ReactElement } from "react";
import {
  Paper,
  IconButton,
  Typography,
  Card,
  List,
  Chip,
  Avatar,
  Dialog,
  TextField,
  DialogActions,
  Button,
  makeStyles,
} from "@material-ui/core";
import SVG from "react-inlinesvg";

import Autocomplete from "@material-ui/lab/Autocomplete";
import { Add } from "@material-ui/icons";
import { theme, icons } from "@gliff-ai/style";
import { Profile, Project } from "@/interfaces";

const useStyles = makeStyles({
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
  },
  projectsTopography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginLeft: "8px",
  },
  cancelButton: {
    textTransform: "none",
  },
  OKButton: {
    "&:hover": {
      backgroundColor: theme.palette.info.main,
    },
  },
  tableCell: {
    padding: "0px 16px 0px 25px",
    fontSize: "16px",
    maxHeight: "28px",
  },
  chipLabel: {
    margin: "5px 5px 0 0",
    borderColor: "black",
    borderRadius: "9px",
  },
  iconSize: {
    width: "15px",
  },
  addButton: {
    color: "#000000",
  },
});

interface Props {
  projects: Project[] | null;
  projectInvitees: Profile[] | null;
  createProject: (newName: string) => Promise<string>;
  inviteToProject: (projectId: string, inviteeEmail: string) => Promise<void>;
}

export function CreateProjectDialog({
  projects,
  projectInvitees,
  createProject,
  inviteToProject,
}: Props): ReactElement {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [dialogInvitees, setDialogInvitees] = useState<Profile[] | null>([]);

  const classes = useStyles();
  return (
    <>
      <IconButton
        className={classes.addButton}
        onClick={() => setDialogOpen(true)}
      >
        <Add />
      </IconButton>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <Card>
          <Paper
            className={classes.paperHeader}
            elevation={0}
            variant="outlined"
            square
          >
            <Typography className={classes.projectsTopography}>
              Create Project
            </Typography>
          </Paper>
          <Paper elevation={0} square style={{ width: "20vw", margin: "20px" }}>
            <TextField
              placeholder="Project Name"
              style={{ width: "100%" }}
              onChange={(event) => {
                setNewProjectName(event.target.value);
              }}
            />
            {/* eslint-disable react/jsx-props-no-spreading */}
            <Autocomplete
              options={projectInvitees}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Team Members"
                  variant="outlined"
                />
              )}
              style={{ marginTop: "26px" }}
              onChange={(event, value) => {
                // add the selected user profile to dialogInvitees if it's not already there:
                if (!value) return;
                setDialogInvitees(
                  dialogInvitees.includes(value as Profile)
                    ? dialogInvitees
                    : dialogInvitees.concat(value as Profile)
                );
              }}
            />
            <List>
              {dialogInvitees?.map((profile) => (
                <Chip
                  key={profile.email}
                  avatar={
                    <Avatar
                      variant="circular"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        // remove `email` from dialogInvitees:
                        setDialogInvitees(
                          dialogInvitees.filter(
                            (_profile) => _profile.email !== profile.email
                          )
                        );
                      }}
                    >
                      <SVG
                        className={classes.iconSize}
                        src={icons.removeLabel}
                        fill="inherit"
                      />
                    </Avatar>
                  }
                  className={classes.chipLabel}
                  label={profile.name}
                  variant="outlined"
                />
              ))}
            </List>
            <DialogActions>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                }}
                className={classes.cancelButton}
              >
                Cancel
              </Button>
              <Button
                className={classes.OKButton}
                variant="contained"
                color="primary"
                disabled={
                  newProjectName === "" ||
                  projects.map((p) => p.name).includes(newProjectName)
                }
                onClick={() => {
                  createProject(newProjectName).then(
                    (newProjectUid) => {
                      for (const profile of dialogInvitees) {
                        inviteToProject(newProjectUid, profile.email).catch(
                          (err) => {
                            console.error(err);
                          }
                        );
                      }
                    },
                    (err) => {
                      console.error(err);
                    }
                  );
                  setDialogOpen(false);
                }}
              >
                OK
              </Button>
            </DialogActions>
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}