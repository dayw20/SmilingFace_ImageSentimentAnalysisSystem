import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import SummarizeIcon from '@mui/icons-material/Summarize'
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ThemeProvider, createTheme, styled } from '@mui/material/styles'
import * as React from 'react'
import { JobInfo } from './App'
import { JobForm, JobStatus } from './TopicAnalysis'

function Copyright (props: any): JSX.Element {
  return (
    <Typography variant='body2' color='text.secondary' align='center' {...props}>
      Copyright © Smiling Face Consulting, Inc.
      {new Date().getFullYear()}
      .
    </Typography>
  )
}

const drawerWidth: number = 240

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9)
        }
      })
    }
  })
)

const defaultTheme = createTheme()

// entry in the sidebar for a job, allowing users to select a job
function JobLink (props: { jobId: number, topic: string, selectJob: () => void, selected: boolean }): JSX.Element {
  return (
    <ListItemButton onClick={() => props.selectJob()} selected={props.selected}>
      <ListItemIcon>
        <SummarizeIcon />
      </ListItemIcon>
      <ListItemText primary={props.topic} />
    </ListItemButton>
  )
}

// the main part of the page
export default function Dashboard (props: { submitNewJob: (name: string, withNeighbors: boolean, jobIdx: number) => void, selectJob: (idx: number) => void, newAnalysis: () => void, jobInfos: JobInfo[], currentJob: number }): JSX.Element {
  const [open, setOpen] = React.useState(true)
  const toggleDrawer = (): void => {
    setOpen(!open)
  }
  const job = props.jobInfos[props.currentJob]

  function submitNewJob (name: string, withNeighbors: boolean): void {
    props.submitNewJob(name, withNeighbors, props.currentJob)
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position='absolute' open={open}>
          <Toolbar
            sx={{
              pr: '24px' // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge='start'
              color='inherit'
              aria-label='open drawer'
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' })
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component='h1'
              variant='h6'
              color='inherit'
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Smiling Face Analysis
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant='permanent' open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1]
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component='nav'>
            {/* sidebar for creating new jobs and switching between existing jobs */}
            <ListItemButton>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary='New Analysis' onClick={() => props.newAnalysis()} />
            </ListItemButton>

            {props.jobInfos.map((jobInfo, idx) => <JobLink jobId={idx} topic={jobInfo.topic} selectJob={() => props.selectJob(idx)} selected={idx === props.currentJob} />)}

          </List>
        </Drawer>
        <Box
          component='main'
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto'
          }}
        >
          <Toolbar />
          <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
            {/* central part of the page with the form and possibly results, progress bars, errors, ... */}
            <JobForm submitJob={submitNewJob} topic={job.topic} withNeighbors={job.withNeighbors} jobIdx={props.currentJob} />

            {(job.status != null) && <JobStatus status={job.status} />}

            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
