let data = [];

async function loadData() {
    data = await d3.csv("mouse.csv", (row) => ({
        //Day_act,Ovulating_act,Night_act
        Day: +row.Day_act, // Convert day column to number
        Ovulating: row.Ovulating_act === "1", // Convert to boolean
        Night: row.Night_act === "1", // Convert to boolean
    
        // Female Temperatures
        f1_temp: +row.f1_temp, f2_temp: +row.f2_temp, f3_temp: +row.f3_temp,
        f4_temp: +row.f4_temp, f5_temp: +row.f5_temp, f6_temp: +row.f6_temp,
        f7_temp: +row.f7_temp, f8_temp: +row.f8_temp, f9_temp: +row.f9_temp,
        f10_temp: +row.f10_temp, f11_temp: +row.f11_temp, f12_temp: +row.f12_temp,
        f13_temp: +row.f13_temp,
    
        // Female Activity
        f1_act: +row.f1_act, f2_act: +row.f2_act, f3_act: +row.f3_act,
        f4_act: +row.f4_act, f5_act: +row.f5_act, f6_act: +row.f6_act,
        f7_act: +row.f7_act, f8_act: +row.f8_act, f9_act: +row.f9_act,
        f10_act: +row.f10_act, f11_act: +row.f11_act, f12_act: +row.f12_act,
        f13_act: +row.f13_act,
    
        // Male Temperatures
        m1_temp: +row.m1_temp, m2_temp: +row.m2_temp, m3_temp: +row.m3_temp,
        m4_temp: +row.m4_temp, m5_temp: +row.m5_temp, m6_temp: +row.m6_temp,
        m7_temp: +row.m7_temp, m8_temp: +row.m8_temp, m9_temp: +row.m9_temp,
        m10_temp: +row.m10_temp, m11_temp: +row.m11_temp, m12_temp: +row.m12_temp,
        m13_temp: +row.m13_temp,
    
        // Male Activity
        m1_act: +row.m1_act, m2_act: +row.m2_act, m3_act: +row.m3_act,
        m4_act: +row.m4_act, m5_act: +row.m5_act, m6_act: +row.m6_act,
        m7_act: +row.m7_act, m8_act: +row.m8_act, m9_act: +row.m9_act,
        m10_act: +row.m10_act, m11_act: +row.m11_act, m12_act: +row.m12_act,
        m13_act: +row.m13_act,
      }));
    
      console.log("Data Loaded:", data);
      console.log(data[0]); // Logs first row
      console.log(typeof data[0].f1_temp); // Should be "number"
      console.log(typeof data[0].Day); // Should be "number"
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

