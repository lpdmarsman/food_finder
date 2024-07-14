# For more information, please refer to https://aka.ms/vscode-docker-python
FROM --platform=linux/amd64 python:3.10-slim

EXPOSE 8000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

WORKDIR /food

# Install pip requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files to the working directory
COPY . /food/

# Run the application
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
