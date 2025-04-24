FROM python:3.12-slim

WORKDIR /app

COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8001

ENV PYTHONUNBUFFERED=1

CMD ["python", "main.py"]
