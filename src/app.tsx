import { Component } from 'react'
import './app.scss'

console.log('App component loading...')

class App extends Component<any> {
  componentDidMount() {
    console.log('App component mounted!')
  }

  componentWillUnmount() {}

  render() {
    console.log('App rendering children:', this.props.children)
    return this.props.children
  }
}

export default App