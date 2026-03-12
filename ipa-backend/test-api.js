async function run() {
    const res = await fetch("http://localhost:4000/api/students/1");
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
run();
