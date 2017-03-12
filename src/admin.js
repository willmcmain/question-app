"use strict";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormControl, FormGroup, InputGroup, ControlLabel, Modal, Button, Glyphicon} from 'react-bootstrap';

export default class QuestionAdmin extends React.Component {
    constructor() {
        super();
        this.state = {
            questions: [],
        }
    }

    componentDidMount() {
        this.load_questions();
    }

    load_questions() {
        var that = this;
        $.ajax({
            url: "/questions/?results_per_page=25"
        })
        .done(function(data) {
            that.setState({
                questions: data,
            });
        })
    }

    delete_question(qid) {
        var that = this;
        $.ajax({
            url: '/questions/' + qid + '/',
            method: 'DELETE'
        })
        .done(function(data) {
            that.load_questions();
        })
        .fail(function(jqXHR, textStatus) {
            alert("DELETE Request failed: " + textStatus);
        });
    }

    update_question(question) {
        var that = this;
        $.ajax({
            url: '/questions/' + question.qid + '/',
            method: 'PUT',
            data: question,
            traditional: true
        })
        .done(function(data) {
            that.load_questions();
        })
    }

    render() {
        return (
            <table className='table table-hover'>
              <thead>
                <tr>
                  <th></th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Wrong Answers</th>
                </tr>
              </thead>
              <tbody>
                {this.state.questions.map((q, i) =>
                  <QuestionEntry
                    key={q.qid}
                    question={q}
                    onupdate={(qid) => this.update_question(qid)}
                    ondelete={(qid) => this.delete_question(qid)} />
                )}
              </tbody>
            </table>
        );
    }
}


function QuestionEntry(props) {
    return (
        <tr>
          <td>
            <EditBox question={props.question} onupdate={props.onupdate} />
            <DeleteBox question={props.question} ondelete={props.ondelete} />
          </td>
          <td>{props.question.question}</td>
          <td>{props.question.answer}</td>
          <td>{props.question.distractors.join(', ')}</td>
        </tr>
    );
}


class DeleteBox extends React.Component {
    constructor() {
        super();
        this.state = {
            show: false
        }
    }

    open() {
        this.setState({show: true});
    }

    close() {
        this.setState({show: false});
    }

    delete_q() {
        this.props.ondelete(this.props.question.qid);
        this.close();
    }

    render() {
        return (
          <div style={ {display: 'inline-block'} }>
            <Button onClick={() => this.open()}>
              <Glyphicon glyph='trash' />
            </Button>

            <Modal show={this.state.show} onHide={() => this.close()}>
              <Modal.Header>
                <Modal.Title>Really Delete This Question?</Modal.Title>
              </Modal.Header>
              <Modal.Body>{this.props.question.question}</Modal.Body>
              <Modal.Footer>
                <Button bsStyle='danger' onClick={()=>this.delete_q()}>
                  Delete
                </Button>
                <Button onClick={()=>this.close()}>Cancel</Button>
              </Modal.Footer>
            </Modal>
          </div>
        )
    }
}


class EditBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            // deep copy question object so we don't clobber the state
            question: $.extend(true, {}, props.question)
        }
    }

    open() {
        this.setState({show: true});
    }

    close() {
        // reload original question object; we want to lose our changes if
        // we close the edit box without saving
        this.setState({
            show: false,
            question: $.extend(true, {}, this.props.question)
        });
    }

    update() {
        this.props.onupdate(this.state.question);
        this.close();
    }

    formHandler(e) {
        var question = this.state.question;
        question[e.target.name] = e.target.value;
        this.setState({question: question});
    }

    distractorHandler(i, e) {
        var question = this.state.question;
        question.distractors[i] = e.target.value;
        this.setState({question: question})
    }

    addDistractor() {
        var question = this.state.question;
        question.distractors = question.distractors.concat(['']);
        this.setState({question: question})
    }

    removeDistractor(i) {
        var question = this.state.question;
        question.distractors = question.distractors.slice();
        question.distractors.splice(i, 1);
        this.setState({question: question})
    }

    render() {
        return (
          <div style={ {display: 'inline-block'} }>
            <Button onClick={() => this.open()}>
              <Glyphicon glyph='pencil' />
            </Button>

            <Modal show={this.state.show} onHide={() => this.close()}>
              <Modal.Header>
                <Modal.Title>Edit Question</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form>
                <FormGroup controlId='question'>
                  <ControlLabel>Question</ControlLabel>
                  <FormControl
                    name='question'
                    type='text'
                    value={this.state.question.question}
                    onChange={(e) => this.formHandler(e)}
                  />
                </FormGroup>
                <FormGroup controlId='answer'>
                  <ControlLabel>Answer</ControlLabel>
                  <FormControl
                    name='answer'
                    type='text'
                    value={this.state.question.answer}
                    onChange={(e) => this.formHandler(e)}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Wrong Answers</ControlLabel>
                  {this.state.question.distractors.map((distractor, i) =>
                      <InputGroup key={i}>
                        <FormControl
                          name={'distractor' + i}
                          type='text'
                          value={distractor}
                          onChange={(e) => this.distractorHandler(i,e)}
                        />
                        <InputGroup.Button>
                          <Button onClick={()=>this.removeDistractor(i)}>
                          <Glyphicon glyph="minus" />
                          </Button>
                        </InputGroup.Button>
                      </InputGroup>
                  )}
                </FormGroup>
                <Button onClick={()=>this.addDistractor()}>
                  <Glyphicon glyph='plus' />
                </Button>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button bsStyle='primary' onClick={()=>this.update()}>
                  Update
                </Button>
                <Button onClick={()=>this.close()}>Cancel</Button>
              </Modal.Footer>
            </Modal>
          </div>
        )
    }
}
