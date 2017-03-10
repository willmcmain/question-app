import random
from collections import OrderedDict
from flask import Flask, request
from flask_restful import Resource, Api, abort, fields, marshal_with, marshal
from flask_restful import reqparse
from sqlalchemy import create_engine, select

from db import questions

app = Flask(__name__)
api = Api(app)

app.config['DEBUG'] = True
app.config['DATABASE'] = "sqlite:///challenge.db"

engine = create_engine(app.config['DATABASE'])

##### API #####
class Question:
    def __init__(self, obj):
        self.qid = obj['id']
        self.question = obj['question']
        self.answer = obj['answer']
        if isinstance(obj['distractors'], str):
            self.distractors = [x.strip()
                    for x in obj['distractors'].split(',')]
        else:
            self.distractors = obj['distractors']

    def db_serialize(self):
        return {
            'id': self.qid,
            'question': self.question,
            'answer': self.answer,
            'distractors': ','.join(self.distractors)
        }


question_fields = {
    'qid': fields.Integer,
    'question': fields.String,
    'answer': fields.String,
    'uri': fields.Url('question'),
    'distractors': fields.List(fields.String),
}

question_parser = reqparse.RequestParser()
question_parser.add_argument('question', required=True)
question_parser.add_argument('answer', required=True)
question_parser.add_argument('distractors', required=True, action='append')


class QuestionResource(Resource):
    def question_or_404(self, qid):
        with engine.connect() as conn:
            query = select([questions]).where(questions.c.id == qid)
            obj = conn.execute(query).fetchone()
        if obj is None:
            abort(404, message="Question {} doesn't exist".format(qid))
        return obj

    @marshal_with(question_fields)
    def get(self, qid):
        obj = self.question_or_404(qid)
        return Question(obj)

    @marshal_with(question_fields)
    def put(self, qid):
        args = question_parser.parse_args()
        q = Question({
            'id': qid,
            'question': args['question'],
            'answer': args['answer'],
            'distractors': args['distractors']})
        with engine.connect() as conn:
            # check if id already exists
            query = select([questions]).where(questions.c.id == qid)
            obj = conn.execute(query).fetchone()
            if obj is None:
                query = questions.insert()
            else:
                query = questions.update().where(questions.c.id == qid)

            conn.execute(query, q.db_serialize())
        return q, 201

    def delete(self, qid):
        obj = self.question_or_404(qid)
        with engine.connect() as conn:
            conn.execute(questions.delete().where(questions.c.id == qid))
        return '', 204


class QuestionListResource(Resource):
    num_results = 100

    def get(self):
        page = int(request.args.get('page', 1))
        num_results = int(
                request.args.get('results_per_page', self.num_results))

        with engine.connect() as conn:
            query = (select([questions])
                .limit(num_results)
                .offset((page-1) * num_results)
            )
            data = []
            for row in conn.execute(query):
                q = Question(row)
                data.append(marshal(q, question_fields))

        return data

    @marshal_with(question_fields)
    def post(self):
        args = question_parser.parse_args()
        q = Question({
            'id': None,
            'question': args['question'],
            'answer': args['answer'],
            'distractors': args['distractors']})
        with engine.connect() as conn:
            result = conn.execute(questions.insert(), q.db_serialize())
            q.qid = result.lastrowid

        return q, 201


class RandomQuestionResource(Resource):
    @marshal_with(question_fields)
    def get(self):
        with engine.connect() as conn:
            # get random id
            random_id=random.choice([
                    row[questions.c.id]
                    for row in conn.execute(select([questions.c.id]))])
            q = Question(
                conn.execute(select([questions])
                    .where(questions.c.id == random_id))
                    .fetchone())
            return q


api.add_resource(QuestionListResource, '/questions/')
api.add_resource(QuestionResource, '/questions/<int:qid>/', endpoint='question')
api.add_resource(RandomQuestionResource, '/questions/random/')


##### Frontend #####

if __name__ == '__main__':
    app.run()
