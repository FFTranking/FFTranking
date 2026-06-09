FFT Ranking Dashboard V2 - CSV Version (No Python Required)

วิธีใช้งาน
1) เปิดไฟล์ "FFT Scoring Log.xlsx"
2) กรอก / แก้ไขคะแนนใน Sheet: Scores
3) Save เป็น Excel ตามปกติเพื่อเก็บต้นฉบับ
4) จากนั้นกด File > Save As > เลือกชนิดไฟล์ "CSV UTF-8 (Comma delimited) (*.csv)"
5) ตั้งชื่อไฟล์เป็น "ranking.csv" และ Save ทับไฟล์เดิมในโฟลเดอร์นี้
6) ดับเบิลคลิก "start_dashboard.bat"
7) เปิดเว็บ: http://localhost:8080

หมายเหตุสำคัญ
- ไม่ต้องติดตั้ง Python
- ไม่ต้องติดตั้ง openpyxl
- หน้าเว็บจะอ่าน ranking.csv โดยตรง
- หน้าเว็บจะ Auto Refresh ทุก 5 วินาที
- ถ้าแก้ CSV แล้วข้อมูลยังไม่เปลี่ยน ให้กดปุ่ม Refresh Data หรือ Ctrl + F5
- รูปพนักงานให้ใส่ในโฟลเดอร์ photos และตั้งชื่อเป็น Employee ID เช่น 100183.jpg
- ถ้าพนักงานอันดับสูงไม่มีรูป ระบบจะโชว์ช่องว่าง NO PHOTO ไว้ก่อน ไม่ทำให้หน้าเว็บพัง

คอลัมน์ที่ใช้แสดงบนหน้าเว็บ
- Year
- Month
- Employee ID
- Name
- Department
- Correct Answers (0-20)
- Wearing Time (sec)
- Total Score
- Rank

คอลัมน์ Exam Score และ Time Score สามารถเก็บไว้ใน Excel เพื่อคำนวณ แต่หน้าเว็บจะไม่โชว์ เพื่อไม่ให้พนักงานสับสน
