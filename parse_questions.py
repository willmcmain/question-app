import csv
import sys
from sqlalchemy import create_engine, Table, Column, Integer, String, MetaData

from db import metadata, questions

def main(argv):
    if len(argv) < 3:
        print("Usage: parse_questions.py file_to_parse database")
        sys.exit()

    engine = create_engine('sqlite:///%s' % (argv[2],), echo=True)
    metadata.create_all(engine)

    with open(argv[1]) as f, engine.connect() as conn:
        reader = csv.DictReader(f, delimiter='|')
        conn.execute(questions.insert(), list(reader))


if __name__ == '__main__':
    main(sys.argv)

