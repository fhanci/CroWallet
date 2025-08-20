# Image Name: corwallet-backend
# Image Tag: 0.2.0

# Stage 1: Build the application using Maven and JDK 24
FROM maven:3.9.11-eclipse-temurin-24-alpine AS build
WORKDIR /app

# Copy Maven project files
COPY pom.xml .
COPY src ./src

# Build the application (skip tests for faster build)
RUN mvn clean package -DskipTests

# Stage 2: Run the application using JDK 24
FROM openjdk:24-jdk-slim
WORKDIR /app

# Copy the built jar from the previous stage
COPY --from=build /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8082

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]

