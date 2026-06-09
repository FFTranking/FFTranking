FFT Ranking Dashboard V3 - Mobile Tabs

New features:
1. Mobile layout based on Sample 1.
2. Dashboard tab: Champion + scrollable Top 10 ranking.
3. All Participants tab: all employees who joined training in selected month.
4. Total FFT Training tab: department completion progress with donut chart.
5. Photo crop improved: images fill the frame using object-fit cover and slight zoom.

Files to upload to GitHub root:
- index.html
- style.css
- script.js
- ranking.csv
- department_targets.csv
- photos/ folder

How to update monthly:
1. Update FFT Scoring Log.xlsx.
2. Export as CSV UTF-8 and replace ranking.csv.
3. Upload/replace ranking.csv on GitHub.
4. If there are new photos, upload to photos/ using Employee ID as filename.
5. Update department_targets.csv only when total staff by department changes.

Department targets:
Edit department_targets.csv like this:
Department,Total Staff
Front Office,11
Security,10
Engineering,10
