import React, { SyntheticEvent } from "react";

import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Grid, Paper, SvgIcon, Typography, ButtonBase } from "@material-ui/core";
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import Switch from '@material-ui/core/Switch';

import useStyles from "./styles";

import PartIcon from "../../icons/SvgPartIcon";
import AssemblyIcon from "../../icons/SvgAssemblyIcon";
import ConfigurablePartIcon from "../../icons/SvgConfigurablePartIcon";
import ConfigurableAssemblyIcon from "../../icons/SvgConfigurableAssemblyIcon";
import InsertDialog from "../InsertDialog";
import { OnshapeInsertable } from "../../utils/models/OnshapeInsertable";

import { CircularProgress, Button } from '@material-ui/core';

import { insertPart, publishPart } from "../../utils/api"

import ReactGA from "react-ga" 
import SvgFavoriteIcon from "../../icons/SvgFavoriteIcon";


interface ElementProps {
    insertable: OnshapeInsertable;
    isAdminElement: boolean;
}

export default function InsertableElement(props: ElementProps) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [overrideUpdate, setOverrideUpdate] = React.useState(false);
  const [isPublished, setIsPublished] = React.useState(!!props.insertable.lastVersion);
  const [configOpts, setConfigOpts] = React.useState({});

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (props.isAdminElement) {
      return;
    }
    setConfigOpts({});
    if (!props.insertable.config || props.insertable.config.length === 0) {
      handleInsert();
    }
    else {
      setOpen(true);
    }
  };

  const handleInsert = () => {
    ReactGA.event({
      action: 'Insert',
      category: props.insertable.documentName,
      label: props.insertable.name,
      transport: 'xhr'
    });

    setOpen(false);
    // Collect configuration
    let configStr = "";
    for (const key in configOpts) {
      configStr += `${key}=${(configOpts as any)[key] as string};`;
    }
    configStr = configStr.substring(0, configStr.length-1);
    setLoading(true);
    insertPart(props.insertable, configStr).then((result: boolean) => {
      setLoading(false);
    });
  };

  const handleSliderToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const publish = event.target.checked;
    setIsPublished(publish);
    setLoading(true);
    setOverrideUpdate(overrideUpdate || publish);
    publishPart(props.insertable, publish).finally(() => {setLoading(false)});
  };
  const handleUpdateButton = () => {
    const publish = true;
    setIsPublished(publish);
    setLoading(true);
    setOverrideUpdate(true);
    publishPart(props.insertable, publish).finally(() => {setLoading(false)});
  };

  const dialog = <InsertDialog 
    insertable={props.insertable} 
    open={open} 
    setOpen={setOpen} 
    configOpts={configOpts} 
    setConfigOpts={setConfigOpts} 
    handleInsert={handleInsert} />;

  return (
    <Grid item>
      <ButtonBase className={classes.itemBase} onClick={handleClick}>
      <Paper className={classes.paper}>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
          style={{height: "100%", width: "100%"}}
          wrap="nowrap"
        >
          
          <Grid item xs={1}>
            {props.insertable.type === "ASSEMBLY" ? 
            (props.insertable.config && props.insertable.config.length > 0 ? <ConfigurableAssemblyIcon className={classes.icon} /> : <AssemblyIcon className={classes.icon} />) : 
            (props.insertable.config && props.insertable.config.length > 0 ? <ConfigurablePartIcon className={classes.icon} /> : <PartIcon className={classes.icon} />)}
          </Grid>
          {props.insertable.thumb && <Grid item sm={1}><img className={classes.image} src={`data:image/png;base64,${props.insertable.thumb}`} /></Grid>}
          <Grid item xs={10}><div><Typography display="inline" style={{wordWrap: "break-word"}} className={classes.title}>{props.insertable.name}</Typography></div></Grid>
          {props.isAdminElement && !overrideUpdate && isPublished && props.insertable.versionId !== props.insertable.lastVersion && <Grid item sm><Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleUpdateButton}
            startIcon={<NewReleasesIcon />}
          >
            Update
          </Button></Grid>}
          {props.isAdminElement && <Grid item sm={3}><Switch checked={isPublished} onChange={handleSliderToggle} color="primary" /></Grid>}
          {loading && <Grid item xs={3}><CircularProgress /></Grid>}

          
        </Grid>
      </Paper>
      </ButtonBase>
      { !props.isAdminElement && <ButtonBase><SvgFavoriteIcon elementId={props.insertable.elementId}/></ButtonBase> }
      {dialog}
    </Grid>
        
  );
}
