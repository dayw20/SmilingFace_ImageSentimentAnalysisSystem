import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { Button, Checkbox, FormControlLabel, Grid, Paper, TextField } from '@mui/material'
import { useState } from 'react'
import { FaceFeelings, FaceLikelihood, ImageInfo, ImageURL, JobData, Topic } from './jobdata'
import CircularProgress, { CircularProgressProps, } from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// form to edit the topic and whether to include neighbor pages
export function JobForm (props: { submitJob: (name: string, withNeighbors: boolean) => void, topic: string, withNeighbors: boolean, jobIdx: number }): JSX.Element {
  const [name, setName] = useState(props.topic)
  const [withNeighbors, setWithNeighbors] = useState(props.withNeighbors)
  const [jobIdx, setJobIdx] = useState(props.jobIdx)
  if (jobIdx !== props.jobIdx) {
    setJobIdx(props.jobIdx)
    setName(props.topic)
    setWithNeighbors(props.withNeighbors)
  }

  // console.log("rendering job form "+props.topic)
  function onSubmit (e: any): void {
    e.preventDefault()
    props.submitJob(name, withNeighbors)
  }

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <form onSubmit={onSubmit}>
        <TextField name='name' label='Wikipedia topic' variant='outlined' value={name} onChange={(e) => setName(e.target.value)} />
        <FormControlLabel control={<Checkbox checked={withNeighbors} onChange={(e) => setWithNeighbors(e.target.checked)} />} label='include top neighbor topics' name='withNeighbors' />
        <Button variant='contained' type='submit'>Submit</Button>
      </form>
    </Paper>
  )
}

// show results if any
export function JobStatus (props: { status: JobData }): JSX.Element | null {
//  return (props.status.data != null) ? <div> {Object.entries(props.status.data).map(([key, value]) => <TopicResult topic={key} images={value} />)}</div> : null
  if (props.status.data === undefined) {
    return null;
  }
  return (
    <div>
      { props.status.progress !== undefined ? (
        <CircularProgressWithLabel value={props.status.progress.done / props.status.progress.total * 100}/>
      ) : null }
      <div>
        {Object.entries(props.status.data).map(([key, value]) => (
          <TopicResult topic={key} images={value} />
        ))}
      </div>
    </div>
  );
}

function isHappy (face: FaceFeelings): boolean {
  return face.joyLikelihood === FaceLikelihood.VERY_LIKELY || face.joyLikelihood === FaceLikelihood.LIKELY
}
function isUnhappy (face: FaceFeelings): boolean {
  return face.joyLikelihood === FaceLikelihood.VERY_UNLIKELY || face.joyLikelihood === FaceLikelihood.UNLIKELY
}
function isNeutral (face: FaceFeelings): boolean {
  return !isHappy(face) && !isUnhappy(face)
}

// show results for one topic
// shows only images with faces, showing happy ones on the left and unhappy ones on the right
export function TopicResult (props: { topic: Topic, images: ImageInfo }): JSX.Element {
  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <h2>{props.topic}</h2>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <div>Happy</div>
          {Object.entries(props.images).filter(([key, value]) => value.length > 0 && value.filter(isHappy).length > 0).map(([key, value]) => <ImageResult url={key} faces={value} />)}
        </Grid>
        <Grid item xs={4}>
          <div>Neural</div>
          {Object.entries(props.images).filter(([key, value]) => value.length > 0 && value.filter(isNeutral).length > 0).map(([key, value]) => <ImageResult url={key} faces={value} />)}
        </Grid>
        <Grid item xs={4}>
          <div>Unhappy</div>
          {Object.entries(props.images).filter(([key, value]) => value.length > 0 && value.filter(isUnhappy).length > 0).map(([key, value]) => <ImageResult url={key} faces={value} />)}
        </Grid>
      </Grid>
    </Paper>
  )
}

// render one image
function ImageResult (props: { url: ImageURL, faces: FaceFeelings[] }): JSX.Element {
  return <img src={props.url} alt='' />
}

function CircularProgressWithLabel( props: CircularProgressProps & {value: number},) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant='determinate' {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        >
          <Typography
            variant='caption'
            component='div'
            color='text.secondary'
            >
              {`${Math.round(props.value)}%`}
            </Typography>
        </Box>
    </Box>
  );
}