import React, { Component } from 'react'
import { Router, Route, withRouter } from 'react-router-dom'

import ListScreen, { DefaultListScreen } from './components/list'
import BudgetScreen from './components/budget/BudgetScreen'
import Login from './components/Login'
import Auth from './Auth'
import history from './history'
import context from './context'

const auth = new Auth()

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication()
  }
}

const handleOneDriveAuthentication = nextState => {
  if (/access_token/.test(nextState.location.hash)) {
    auth.handleOneDriveAuthentication(nextState.location.hash)
  }
}

const Callback = () => null

const RenderLocationChange = ({ url }) => {
  window.location = url
  return null
}

const ScrollToTop = withRouter(
  class extends Component {
    componentDidUpdate(prevProps) {
      if (this.props.location !== prevProps.location) {
        window.scrollTo(0, 0)
      }
    }

    render() {
      return this.props.children
    }
  }
)

const App = () => {
  const fetch = (component, action, options = {}, headers = {}) => {
    return window.fetch(`${process.env.REACT_APP_SERVER_URI}api/${component}/v1/${action}`, {
      ...options,
      headers: new Headers({
        ...headers,
        Authorization: `Bearer ${auth.getToken()}`
      })
    })
  }

  return (
    <context.Provider value={{ fetch, auth }}>
      <Router history={history}>
        <ScrollToTop>
          <Route exact path="/budget" render={props => (auth.isAuthenticated() ? <BudgetScreen {...props} /> : <Login />)} />
          <Route exact path="/item/:key" render={props => (auth.isAuthenticated() ? <ListScreen {...props} /> : <Login />)} />
          <Route exact path="/" render={props => (auth.isAuthenticated() ? <DefaultListScreen {...props} /> : <Login />)} />
          <Route
            exact
            path="/callback"
            render={props => {
              handleAuthentication(props)
              return <Callback {...props} />
            }}
          />
          <Route
            exact
            path="/onedrive/signin"
            render={() => (
              <RenderLocationChange
                url={
                  `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=a7fba33d-f054-47c3-92d3-27978004647d&scope=files.readwrite.all` +
                  `&response_type=token&redirect_uri=${encodeURIComponent(`${process.env.REACT_APP_CALLBACK_ADDRESS}/onedrive/callback`)}`
                }
              />
            )}
          />
          <Route
            exact
            path="/onedrive/callback"
            render={props => {
              handleOneDriveAuthentication(props)
              return <Callback {...props} />
            }}
          />
        </ScrollToTop>
      </Router>
    </context.Provider>
  )
}

export default App
