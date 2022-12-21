AddonBuilder clone do(
    if(platform == "linux",
        dependsOnLib("rt")
    )
    dependsOnHeader("aio.h")
)
