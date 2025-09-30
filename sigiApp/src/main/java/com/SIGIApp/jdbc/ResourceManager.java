package com.SIGIApp.jdbc;

import java.sql.*;

public class ResourceManager
{
    /////CONEXIÓN POR INTERNET
    private static String JDBC_DRIVER   = "com.mysql.jdbc.Driver";
    private static String JDBC_URL      = "jdbc:mysql://m1uc.mooo.com:53306/sigia";
    private static String JDBC_USER     = "Admin";
    private static String JDBC_PASSWORD = "Sigia2025";
        
    
    ///CONEXIÓN DESDE CASA
    /*private static String JDBC_DRIVER   = "com.mysql.jdbc.Driver";
    private static String JDBC_URL      = "jdbc:mysql://192.168.200.221:3306/sigia";

    private static String JDBC_USER     = "Admin";
    private static String JDBC_PASSWORD = "Sigia2025";*/
    
    

    private static Driver driver = null;

    public static synchronized Connection getConnection()
	throws SQLException
    {
        if (driver == null)
        {
            try
            {
                Class jdbcDriverClass = Class.forName( JDBC_DRIVER );
                driver = (Driver) jdbcDriverClass.newInstance();
                DriverManager.registerDriver( driver );
            }
            catch (Exception e)
            {
                System.out.println( "Failed to initialise JDBC driver" );
                e.printStackTrace();
            }
        }

        return DriverManager.getConnection(
                JDBC_URL,
                JDBC_USER,
                JDBC_PASSWORD
        );
    }


	public static void close(Connection conn)
	{
		try {
			if (conn != null) conn.close();
		}
		catch (SQLException sqle)
		{
			sqle.printStackTrace();
		}
	}

	public static void close(PreparedStatement stmt)
	{
		try {
			if (stmt != null) stmt.close();
		}
		catch (SQLException sqle)
		{
			sqle.printStackTrace();
		}
	}

	public static void close(ResultSet rs)
	{
		try {
			if (rs != null) rs.close();
		}
		catch (SQLException sqle)
		{
			sqle.printStackTrace();
		}

	}

}
