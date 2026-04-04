import streamlit as st
import pandas as pd
import os
import time

# --- CONFIGURATION ---
DATA_FILE = "transactions.csv"

def load_data():
    if os.path.isfile(DATA_FILE):
        df = pd.read_csv(DATA_FILE)
        # Ensure timestamp is datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        return df
    return pd.DataFrame()

# --- STREAMLIT UI ---
st.set_page_config(page_title="UPI Fraud Simulator Dashboard", layout="wide")

st.title("UPI Fraud Analysis & Simulation Dashboard")
st.markdown("This dashboard displays live reports from your mobile app.")

# Auto-refresh
# st.empty() is used to clear any existing notification
if "last_refresh" not in st.session_state:
    st.session_state.last_refresh = time.time()

# Main Logic
df = load_data()

if not df.empty:
    # --- Metrics (Sidebar) ---
    st.sidebar.header("Real-time Stats")
    st.sidebar.metric("Total Transactions", len(df))
    st.sidebar.metric("Total Amount", f"₹{pd.to_numeric(df['amount']).sum():,.2f}")
    st.sidebar.metric("Unique VPA Targets", df['vpa'].nunique())

    # Device Distribution (Chart)
    st.sidebar.subheader("Device Distribution")
    st.sidebar.bar_chart(df['brand'].value_counts() if 'brand' in df.columns else pd.Series())

    # --- Live Data Table ---
    st.subheader("Live Transaction Stream")
    st.dataframe(df.sort_values(by="timestamp", ascending=False), use_container_width=True)

    # --- Geo Map ---
    geo_df = df.dropna(subset=['latitude', 'longitude'])
    if not geo_df.empty:
        st.subheader("📍 Geospatial Fraud Map")
        st.map(geo_df[['latitude', 'longitude']])
    else:
        st.info("No geolocation data available yet.")

    # --- CSV Download ---
    csv = df.to_csv(index=False).encode('utf-8')
    st.download_button(
        "Download Full History (CSV)",
        csv,
        "fraud_history.csv",
        "text/csv",
        key='download-csv'
    )
else:
    st.warning("Waiting for data from the mobile app...")
    st.info("Ensure `api.py` is running and your phone is connected to port **8000**.")

# Custom Auto-refresh (Every 10 seconds)
time.sleep(10)
st.rerun()
