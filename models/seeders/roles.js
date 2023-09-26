// initDB(){
//     Role.create({
//         name: "Adminsitrador",
//     });
//     Role.create({
//         name: "Cliente",
//     });

//     console.log("DB initialized");
// }

exports.init = async (Role) => {
    await Role.create({
        name: "Adminsitrador",
    });
    await Role.create({
        name: "Cliente",
    });

    console.log("Roles table seeded");
}
