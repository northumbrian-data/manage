import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Paper,
  IconButton,
  Typography,
  Card,
  makeStyles,
  List,
  ListItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  ListSubheader,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { theme } from "@gliff-ai/style";
import { Team } from "@/interfaces";
import { ServiceFunctions } from "@/api";
import { useAuth } from "@/hooks/use-auth";
import { PageSelector } from "@/components/PageSelector";

const useStyles = makeStyles(() => ({
  topography: {
    color: "#000000",
    display: "inline",
    fontSize: "21px",
    marginRight: "125px",
    paddingLeft: "8px",
  },
  paperHeader: {
    padding: "10px",
    backgroundColor: theme.palette.primary.main,
  },
  paperBody: {
    margin: "15px",
    width: "95%",
    fontSize: "17px",
    paddingLeft: "6px",
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "column",
    width: "30%",
    marginRight: "20px",
  },
  teamCard: {
    marginRight: "20px",
    marginBottom: "20px",
    overflow: "auto",
  },
  tableText: {
    fontSize: "16px",
    paddingLeft: "20px",
  },
  textField: {
    width: "200px",
  },
  featureListHeader: {
    fontSize: "14px",
    lineHeight: "16px",
    padding: "5px 5px 0px",
  },
  featureListItem: {
    fontSize: "12px",
    lineHeight: "14px",
    padding: "0px 15px 0px",
  },
}));

interface Props {
  services: ServiceFunctions;
}

export const TeamView = (props: Props): JSX.Element => {
  const auth = useAuth();

  if (!auth) return null;
  const [team, setTeam] = useState<Team>({
    profiles: [],
    pending_invites: [],
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const classes = useStyles();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setInviteEmail(value);
  };

  const inviteNewUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteMessage("");

    const result = await props.services.inviteUser({
      email: inviteEmail,
    });

    if (result) {
      setInviteEmail("");
      setInviteMessage("Invite was sent");
    } else {
      setInviteMessage("An error happened with the invite");
    }
  };

  useEffect(() => {
    if (auth?.user?.email) {
      void props.services
        .queryTeam(null, auth.user.authToken)
        .then((t: Team) => setTeam(t));
    }
  }, [auth]);

  let pendingInvites;
  if (team?.pending_invites?.length > 0) {
    pendingInvites = (
      <List>
        {team?.pending_invites.map(
          ({ email, sent_date, is_collaborator }) =>
            !is_collaborator && (
              <ListItem key={email}>
                {email} - {sent_date}
              </ListItem>
            )
        )}
      </List>
    );
  } else {
    pendingInvites = (
      <Typography style={{ marginTop: "10px", marginBottom: "15px" }}>
        No pending invites
      </Typography>
    );
  }

  const inviteForm = (
    <>
      <Typography>Why not invite someone else to the team?</Typography>
      <form autoComplete="off" onSubmit={inviteNewUser}>
        <div>{inviteMessage}</div>
        <div style={{ display: "flex" }}>
          <TextField
            id="invite-email"
            type="email"
            required
            onChange={handleChange}
            value={inviteEmail}
            label="Email address"
            className={classes.textField}
            variant="filled"
          />
          <IconButton type="submit">
            <Send />
          </IconButton>
        </div>
      </form>
    </>
  );

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          flexGrow: 0,
          flexShrink: 0,
          marginLeft: "20px",
          marginRight: "20px",
        }}
      >
        <PageSelector page="team" />
      </div>
      <Card
        className={classes.teamCard}
        style={{ width: "70%", height: "85vh" }}
      >
        <Paper
          elevation={0}
          variant="outlined"
          square
          className={classes.paperHeader}
        >
          <Typography className={classes.topography}>
            Current team members
          </Typography>
        </Paper>
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableText}>Name</TableCell>
                <TableCell className={classes.tableText}>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {team?.profiles.map(
                ({ email, name, is_collaborator }) =>
                  !is_collaborator && (
                    <TableRow key={email}>
                      <TableCell className={classes.tableText}>
                        {name}
                      </TableCell>
                      <TableCell className={classes.tableText}>
                        {email}
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <div className={classes.cardsContainer}>
        <Card
          className={classes.teamCard}
          style={{ width: "100%", height: "100%" }}
        >
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.topography}>
              gliff.ai teams
            </Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            <Typography>
              gliff.ai teams allow you to bring together domain experts, data
              experts and compliance experts to develop your AI models.
            </Typography>
            <List>
              <ListSubheader className={classes.featureListHeader}>
                A team member can:
              </ListSubheader>
              <ListItem className={classes.featureListItem}>
                Create, delete and modify projects
              </ListItem>
              <ListItem className={classes.featureListItem}>
                Upload new data
              </ListItem>
              <ListItem className={classes.featureListItem}>
                Create annotations
              </ListItem>
              <ListItem className={classes.featureListItem}>
                See a project audit (plan dependent)
              </ListItem>
              <ListSubheader className={classes.featureListHeader}>
                A team member cannot:
              </ListSubheader>
              <ListItem className={classes.featureListItem}>
                See or update billing
              </ListItem>
            </List>
            <Typography>
              Just want an expert to add annotations to your data? Why not
              consider collaborators instead of team members?
            </Typography>
          </Paper>
        </Card>

        <Card
          className={classes.teamCard}
          style={{ width: "100%", height: "100%" }}
        >
          <Paper
            elevation={0}
            variant="outlined"
            square
            className={classes.paperHeader}
          >
            <Typography className={classes.topography}>
              Pending team invites
            </Typography>
          </Paper>
          <Paper elevation={0} square className={classes.paperBody}>
            {pendingInvites}
            <hr
              style={{ width: "80%", marginLeft: "5px", marginRight: "5px" }}
            />
            {inviteForm}
          </Paper>
        </Card>
      </div>
    </div>
  );
};