import psycopg2
import traceback

def connect_to_postgres():
    connection = None
    try:
        # Replace with your actual database credentials
        connection = psycopg2.connect(
            database="mcq",
            user="postgres",
            password="postgres",
            host="localhost",
            port="5432"
        )
        # Create a cursor object to perform database operations
        cursor = connection.cursor()
        print("Connected to PostgreSQL database successfully!")

        # Execute a simple query
        cursor.execute("SELECT version();")
        
        # Fetch the result
        db_version = cursor.fetchone()
        print(f"PostgreSQL database version: {db_version}")

        # Close the cursor and connection
        cursor.close()
        connection.close()
        print("Database connection closed.")

    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL:", error)
        # Optional: print a traceback for debugging
        # traceback.print_exc() 
    finally:
        if connection:
            # Ensure the connection is closed even if an error occurs
            connection.close()

if __name__ == "__main__":
    connect_to_postgres()

