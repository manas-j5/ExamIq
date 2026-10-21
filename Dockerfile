# Stage 1: Build the Spring Boot backend
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY backend/pom.xml .
RUN mvn dependency:go-offline -B || true

COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal lightweight runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /workspace/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
