🚨 Fraud Detection Dashboard

A full-stack fraud detection web application that predicts fraudulent transactions using machine learning, powered by a FastAPI backend and Supabase database, with an interactive frontend dashboard.

📌 Overview

This project is designed to simulate a real-world fraud detection system. It allows users to input transaction data and instantly receive predictions on whether the transaction is fraudulent or legitimate.

The system combines:

A trained ML model for prediction
FastAPI for backend APIs
Supabase for data storage
A frontend dashboard for visualization
✨ Features
🔍 Fraud Detection Model
Predicts fraud based on transaction inputs
⚡ FastAPI Backend
Handles prediction requests efficiently
🗄️ Supabase Integration
Stores transactions and prediction results
📊 Dashboard Visualization
Displays fraud vs non-fraud distribution (pie chart)
🔄 Real-time Predictions
Instant results based on user input
🛠️ Tech Stack

Frontend

Streamlit / HTML-CSS-JS (based on your implementation)

Backend

FastAPI
Uvicorn

Database

Supabase (PostgreSQL)

Machine Learning

Python
Scikit-learn
📁 Project Structure
fraudapp/
│
├── app.py                 # Frontend (Streamlit dashboard)
├── main.py                # FastAPI backend
├── model.pkl             # Trained ML model
├── requirements.txt
├── supabase_client.py    # Supabase connection logic
└── README.md
⚙️ Setup Instructions
1. Clone the Repository
git clone https://github.com/kaushikbot06/fraudapp.git
cd fraudapp
2. Create Virtual Environment
python -m venv venv

Activate it:

Windows:
venv\Scripts\activate
Mac/Linux:
source venv/bin/activate
3. Install Dependencies
pip install -r requirements.txt
4. Configure Supabase

Create a .env file:

SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
5. Run Backend (FastAPI)
uvicorn main:app --reload

👉 Runs at:
http://127.0.0.1:8000

6. Run Frontend
streamlit run app.py
📡 API Endpoint
🔹 Predict Fraud

POST /predict

Request Body
{
  "amount": 1000,
  "oldbalanceOrg": 5000,
  "newbalanceOrig": 4000,
  "oldbalanceDest": 2000,
  "newbalanceDest": 3000
}
Response
{
  "prediction": "Fraudulent"
}
🧠 Model Info
Model Type: Classification
Objective: Detect fraudulent financial transactions
Input Features:
Transaction amount
Account balances
Transfer patterns
🚀 Future Improvements
🔐 User authentication (login/signup)
📈 Advanced analytics dashboard
☁️ Cloud deployment (AWS / Vercel / Render)
🧠 Improve model accuracy with more data
🔄 Live transaction monitoring
👨‍💻 Contributors
Kaushik
Pradhyumna Prabhu Desai
Grace Keisam
⭐ Show Your Support

If you found this project useful, give it a ⭐ on GitHub!

📜 License

MIT License