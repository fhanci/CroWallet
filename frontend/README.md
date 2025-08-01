# React + Vite

havelsanda staja başladığımda React + Vite + java + spring boot + docker ortamlarına aşına olmak adına sıfrdan yeni bir proje oluşturmamı ve güncel koda aşına olma maksayı ile bu proje başlatılmıştır.

Crowellat projesi kişisel hesapların local ortamda kayıt edilebilmesi ve tekip edilmesi için tasarlandı. 


Docker commutları 
```
docker build . -t my-react-app
docker run --name crowallet -p 3000:3000 my-react-app
```