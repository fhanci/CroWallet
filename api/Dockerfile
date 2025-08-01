# Temel image olarak OpenJDK kullan
FROM openjdk:22-jdk-slim

# Çalışma dizinini ayarla
WORKDIR /app

# JAR dosyasını kopyala
COPY target/api.jar app.jar

# Uygulamayı başlat
ENTRYPOINT ["java", "-jar", "app.jar"]
