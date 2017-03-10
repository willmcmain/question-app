from sqlalchemy import Table, Column, Integer, String, MetaData

metadata = MetaData()

questions = Table('questions', metadata,
    Column('id', Integer, primary_key=True),
    Column('question', String),
    Column('answer', String),
    Column('distractors', String),
)
