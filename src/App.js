import React, { Component } from 'react'
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom'

import ListScreen, { DefaultListScreen } from './components/list'
import BudgetScreen from './components/budget/BudgetScreen'

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

class App extends Component {
  render() {
    return (
      <Router>
        <ScrollToTop>
          <div className="App">
            <Route exact path="/budget" component={BudgetScreen} />
            <Route exact path="/item/:key" component={ListScreen} />
            <Route exact path="/" component={DefaultListScreen} />
          </div>
        </ScrollToTop>
      </Router>
    )
  }
}

export default App
