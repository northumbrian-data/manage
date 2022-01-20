import { useState, ChangeEvent, ReactElement, useEffect } from "react";
import {
  Paper,
  Button,
  Card,
  Dialog,
  IconButton,
  Typography,
  makeStyles,
  TextField,
  DialogActions,
  List,
  Chip,
  Checkbox,
  Divider,
} from "@material-ui/core";
import SVG from "react-inlinesvg";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { theme, icons } from "@gliff-ai/style";
import { Profile, Project, ProjectsUsers, ProjectUsers } from "@/interfaces";

const useStyles = makeStyles({
  paperHeader: { padding: "10px", backgroundColor: theme.palette.primary.main },
  card: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    height: "auto",
  },
  inviteBtn: {
    position: "relative",
    marginTop: "15px",
    marginLeft: "100px",
    "&:hover": {
      backgroundColor: theme.palette.info.main,
    },
  },
  userInviteTopography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginLeft: "8px",
  },
  paperBody: {
    margin: "15px",
  },
  chipLabel: {
    margin: "5px 5px 0 0",
    borderRadius: "9px",
  },
  currentChip: { borderColor: "black", color: "black" },
  pendingChip: {
    borderColor: theme.palette.text.hint,
    color: theme.palette.text.hint,
  },
  selectedOptions: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    width: "270px",
    height: "30",
  },
  divider: {
    margin: "30px 0 10px 0",
    width: "100%",
    height: "1.5px",
  },
  checkboxIcon: { width: "18px", height: "auto" },
  closeButton: {
    position: "absolute",
    top: "7px",
    right: "5px",
  },
  closeIcon: { width: "15px" },
});

interface Props {
  projectUid: string;
  projects: Project[] | null;
  projectMembers: ProjectsUsers;
  invitees: Profile[];
  inviteToProject: (projectId: string, inviteeEmail: string) => Promise<void>;
  removeFromProject: (uid: string, username: string) => Promise<void>;
  triggerRefetch: (uid: string) => void;
}

export function EditProjectDialog({
  projects,
  invitees,
  inviteToProject,
  removeFromProject,
  triggerRefetch,
  ...otherProps
}: Props): ReactElement | null {
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedInvitees, setSelectedInvitees] = useState<Profile[]>(null);
  const [projectUid, setProjectUid] = useState<string>(otherProps.projectUid);
  const [projectMembers, setProjectMembers] =
    useState<ProjectUsers | null>(null);
  const [invited, setInvited] = useState<string[] | null>(null);

  useEffect(() => {
    if (
      !otherProps.projectMembers ||
      otherProps.projectMembers[projectUid] === undefined
    )
      return;
    setProjectMembers(otherProps.projectMembers[projectUid]);
  }, [otherProps]);

  useEffect(() => {
    if (!projectMembers) return;
    const newInvited = projectMembers.usernames.concat(
      projectMembers.pendingUsernames
    );
    setInvited(newInvited);
  }, [projectMembers, projectUid]);

  if (!invitees || !projectMembers || !invited || !projects) return null;

  const handleSelectChange = (
    event: ChangeEvent<HTMLSelectElement>,
    value: Profile[]
  ): void => {
    setSelectedInvitees(value);
  };

  const changeCollectionMembers = async () => {
    if (!selectedInvitees) return;
    await Promise.all(
      invitees.map(async (profile) => {
        if (
          selectedInvitees.includes(profile) &&
          !invited.includes(profile.email)
        ) {
          await inviteToProject(projectUid, profile.email);
        }

        if (
          !selectedInvitees.includes(profile) &&
          projectMembers.usernames.includes(profile.email) // can only remove users that have already accepted or rejected invite
        ) {
          await removeFromProject(projectUid, profile.email);
        }
        return true;
      })
    );

    triggerRefetch(projectUid);
    setSelectedInvitees(null);
    setOpen(false);
  };

  const getChips = (members: string[], isPending = false) =>
    members.map((username) => (
      <Chip
        key={username}
        className={`${classes.chipLabel} ${
          isPending ? classes.pendingChip : classes.currentChip
        }`}
        label={username}
        variant="outlined"
      />
    ));

  const inviteSelect = (
    <>
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        disableClearable
        getOptionLabel={(option: Project) => option.name}
        getOptionSelected={(option, value) => option.name === value.name}
        onInputChange={(e: ChangeEvent, newInputKey: string) => {
          const project = projects.find(({ name }) => name === newInputKey);
          if (
            project !== undefined &&
            otherProps.projectMembers[project.uid] !== undefined
          ) {
            setProjectUid(project.uid);
            setProjectMembers(otherProps.projectMembers[project.uid]);
          }
        }}
        options={projects}
        renderInput={(params: unknown) => (
          <TextField {...params} label="Project Name" variant="outlined" />
        )}
        defaultValue={projects.find(({ uid }) => uid === otherProps.projectUid)}
      />
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        multiple
        disableCloseOnSelect
        disableClearable
        value={invitees.filter(({ email }) => invited.includes(email))}
        options={invitees}
        getOptionLabel={(option: Profile): string => option.name}
        renderOption={(option: Profile) => (
          <>
            <Checkbox
              icon={
                <SVG
                  className={classes.checkboxIcon}
                  src={icons.notSelectedTickbox}
                />
              }
              checkedIcon={
                <SVG
                  className={classes.checkboxIcon}
                  src={icons.multipleImageSelection}
                />
              }
              defaultChecked={invited.includes(option.email)}
            />
            {option.name} — {option.email}
          </>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Add or Remove Users"
            variant="outlined"
          />
        )}
        renderTags={(selectedOptions) => (
          <p className={classes.selectedOptions}>
            {selectedOptions.map((option) => option.name).join(", ")}
          </p>
        )}
        style={{ marginTop: "26px" }}
        onChange={handleSelectChange}
      />
      <DialogActions>
        <Button
          className={classes.inviteBtn}
          variant="contained"
          color="primary"
          onClick={changeCollectionMembers}
          disabled={selectedInvitees === null}
        >
          UPDATE
        </Button>
      </DialogActions>
      <Divider className={classes.divider} />
      <List>
        {getChips(projectMembers.usernames)}
        {getChips(projectMembers.pendingUsernames, true)}
      </List>
    </>
  );

  return (
    <>
      <IconButton
        data-testid={`edit-${projectUid}`}
        onClick={() => setOpen(!open)}
      >
        <SVG src={icons.edit} style={{ width: "22px", height: "auto" }} />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Card className={classes.card}>
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.userInviteTopography}>
              Edit Project
            </Typography>
            <IconButton
              className={classes.closeButton}
              onClick={() => setOpen(false)}
            >
              <SVG src={icons.removeLabel} className={classes.closeIcon} />
            </IconButton>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {inviteSelect}
          </Paper>
        </Card>
      </Dialog>
    </>
  );
}
