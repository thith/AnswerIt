import React from 'react';
import { color } from './styles/index'
import { Button } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';

import {
  Header, FormDialog, AddQuestionForm, AnswerForm,
  NewFeed, Thread, Question, Answer
} from './components'
import { toUNIXTimestamp, toUNIT } from './web3/common'
import { addQuestion, addQuestionEvent, addAnswer, addAnswerEvent, getAllQuestion, getAnswers } from './web3/index'
/**
 * MODIFY_TIME: in seconds
 */
const MODIFY_TIME = 15 * 60

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      openForm: false,
      openThread: false,
      rewardFeed: true,
      question: {
        value: '',
        reward: '',
        expireTime: new Date(),
      },
      answer: {
        value: '',
        timestamp: '',
        deadline2Modify: ''
      },
      clickedQuestion: {},
      answers: [],
      questions: []
    }
  }
  handleDateChange(date) {
    this.setState({
      question: {
        ...this.state.question,
        expireTime: date
      }
    })
  }
  handleQuestionContentChange(content) {
    this.setState({
      question: {
        ...this.state.question,
        value: content
      }
    })
  }
  handleAnswerContentChange(content) {
    this.setState({
      answer: {
        ...this.state.answer,
        value: content
      }
    })
  }
  handleQuestionRewardChange(reward) {
    this.setState({
      question: {
        ...this.state.question,
        reward: reward
      }
    })
  }
  submitQuestion() {
    let question = this.state.question
    const reward = toUNIT(parseFloat(question.reward))
    question = {
      ...question,
      expireTime: toUNIXTimestamp(question.expireTime),
      deadline2Modify: toUNIXTimestamp(new Date()) + MODIFY_TIME,
      timestamp: toUNIXTimestamp(new Date()),
      reward: undefined
    }
    addQuestion(question, undefined, reward)
    this.closeForm()

  }
  submitAnswer(toQuestionId) {
    let answer = this.state.answer
    answer = {
      ...answer,
      deadline2Modify: toUNIXTimestamp(new Date()) + MODIFY_TIME,
      timestamp: toUNIXTimestamp(new Date()),
    }
    addAnswer(toQuestionId, answer)
    this.cleanAnswerForm()
  }
  cleanAnswerForm() {
    this.setState({
      answer: {
        value: '',
        timestamp: '',
        deadline2Modify: ''
      }
    })
  }
  cleanForm() {
    this.setState({
      question: {
        value: '',
        reward: '',
        expireTime: new Date(),
      }
    })
  }
  closeForm() {
    this.setState({ openForm: false })
    this.cleanForm()
  }
  renderForm() {
    return (
      <FormDialog
        open={this.state.openForm}
        handleClose={() => this.closeForm()}
        handlePost={() => this.submitQuestion()}
      >
        <AddQuestionForm
          data={this.state.question}
          onDateChange={(date) => this.handleDateChange(date)}
          onContentChange={(content) => this.handleQuestionContentChange(content)}
          onRewardChange={(reward) => this.handleQuestionRewardChange(reward)}
        />
      </FormDialog>
    )

  }
  fetchAnswers(questionId) {
    try {
      getAnswers(questionId).then((answers) => {
        this.setState({
          answers: answers
        })

      })
    } catch (e) {
      throw e
    }
  }
  renderAnswers() {
    return this.state.answers.map((answer, i) => {
      return (
        <Answer key={i} answer={answer} i={i} />
      )
    })
  }
  closeThread() {
    this.setState({
      openThread: false,
      answer: {
        value: '',
        timestamp: '',
        deadline2Modify: ''
      }
    })
  }
  renderThread() {
    return (
      <Thread open={true} handleClose={() => this.closeThread()} >
        <Question isReward={this.state.rewardFeed} question={this.state.clickedQuestion} i={this.state.clickedQuestion.index} />
        <AnswerForm
          value={this.state.answer.value}
          onContentChange={(content) => this.handleAnswerContentChange(content.target.value)}
        />
        <Button style={styles.button} onClick={() => this.submitAnswer(this.state.clickedQuestion.index.toString())} >Post</Button>
        <List>
          {this.renderAnswers()}
        </List>
      </Thread>

    )
  }
  fetchQuestions() {
    getAllQuestion().then(questions => {
      this.setState({ questions })
    })
  }
  componentDidMount() {
    this.fetchQuestions()
    addQuestionEvent(() => this.fetchQuestions())
    addAnswerEvent(() => this.fetchAnswers(this.state.clickedQuestion.index.toString()))
  }
  async onQuestionClick(question, index) {
    this.setState({
      openThread: true,
      clickedQuestion: {
        ...question,
        index
      }
    })
    this.fetchAnswers(index.toString())
  }
  render() {
    const { container, button, feed } = styles
    return (
      <div style={container}>
        <Header />
        <Button style={button} variant="outlined" onClick={() => this.setState({ openForm: true, question: { ...this.state.question, expireTime: new Date() } })}>
          what is your question ?
        </Button>
        <div style={{ alignSelf: 'center' }}>
          <Button style={{ ...button, marginRight: '10px' }} onClick={() => this.setState({ rewardFeed: true })}>Reward</Button>
          <Button style={button} onClick={() => this.setState({ rewardFeed: false })} >Normal</Button>
        </div>
        {this.state.openForm ? this.renderForm() : null}

        <Container maxWidth="sm" style={feed}>
          <NewFeed isReward={this.state.rewardFeed} questions={this.state.questions} onQuestionClick={(q, i) => this.onQuestionClick(q, i)} />
        </Container>
        {this.state.openThread ? this.renderThread() : null}
      </div>
    );
  }
}
const styles = {
  button: {
    background: color.secondary,
    alignSelf: 'center',
    marginTop: '10px'
  },
  container: {
    background: color.primary,
    height: '100vh',
    display: 'flex',
    flexDirection: "column",
  },
  feed: {
    flex: 1,
    marginTop: '10px',
    border: 'solid',
    padding: 0
  }
}
export default App;