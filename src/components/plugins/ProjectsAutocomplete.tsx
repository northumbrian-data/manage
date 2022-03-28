import { ReactElement, ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  Avatar,
  Checkbox,
  FormControlLabel,
  List,
  TextField,
  Chip,
  Autocomplete,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import { icons, lightGrey } from "@gliff-ai/style";
import { IPlugin, Project } from "@/interfaces";

const useStyles = makeStyles({
  marginTop: { marginTop: "15px" },
  option: {
    fontSize: "16px",
    backgroundColor: `#FFFFFF !important`,
    "&:hover": { backgroundColor: `${lightGrey} !important` },
  },
  checkboxIcon: { width: "18px", height: "auto" },
  chipLabel: {
    margin: "5px 5px 0 0",
    borderColor: "black",
    borderRadius: "9px",
  },
  closeIcon: { width: "15px", height: "auto" },
});

interface Props {
  allProjects: Project[];
  plugin: IPlugin;
  setPlugin: Dispatch<SetStateAction<IPlugin>>;
}

export const ProjectsAutocomplete = ({
  allProjects,
  plugin,
  setPlugin,
}: Props): ReactElement => {
  const classes = useStyles();

  const removePluginFromProject = (projectUid: string) =>
    setPlugin((prevPlugin) => ({
      ...prevPlugin,
      collection_uids: prevPlugin.collection_uids.filter(
        (uid) => uid !== projectUid
      ),
    }));

  const updatePluginProjects = (
    event: ChangeEvent<HTMLSelectElement>,
    value: Project[]
  ) =>
    setPlugin((p) => ({
      ...p,
      collection_uids: value.map(({ uid }) => uid),
    }));

  return (
    <>
      {/* eslint-disable react/jsx-props-no-spreading */}
      <Autocomplete
        className={classes.marginTop}
        classes={{ option: classes.option }}
        multiple
        disableCloseOnSelect
        disableClearable
        value={allProjects.filter(({ uid }) =>
          plugin.collection_uids.includes(uid)
        )}
        onChange={updatePluginProjects}
        renderTags={() => null}
        options={allProjects}
        getOptionLabel={(option) => option.name}
        renderOption={(props, option) => (
          <li {...props}>
            <FormControlLabel
              label={option.name}
              control={
                <Checkbox
                  style={{ padding: "10px" }}
                  icon={<div className={classes.checkboxIcon} />}
                  checkedIcon={
                    <SVG
                      className={classes.checkboxIcon}
                      src={icons.multipleImageSelection}
                    />
                  }
                  checked={plugin.collection_uids.includes(option.uid)}
                />
              }
            />
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Add Plug-in to Projects"
          />
        )}
      />
      <List>
        {allProjects
          .filter(({ uid }) => plugin.collection_uids.includes(uid))
          ?.map((project) => (
            <Chip
              variant="outlined"
              key={project.name}
              className={classes.chipLabel}
              label={project.name}
              avatar={
                <Avatar
                  variant="circular"
                  style={{ cursor: "pointer" }}
                  onClick={() => removePluginFromProject(project.uid)}
                >
                  <SVG
                    fill="inherit"
                    className={classes.closeIcon}
                    src={icons.removeLabel}
                  />
                </Avatar>
              }
            />
          ))}
      </List>
    </>
  );
};