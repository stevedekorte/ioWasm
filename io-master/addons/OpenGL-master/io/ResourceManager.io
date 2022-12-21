if(AddonLoader hasAddonNamed("Flux"),
    ResourceManager := Object clone do(
        type ::= "ResourceManager"

        resourcesPath ::= Path with(Flux fluxPath, "resources")
        interfaceToolkit ::= "Flux"

        init := method(
            self paths := List clone
            self cache := Map clone
            self suffixes := List clone
            self tmpDir := Directory clone
        )

        newSlot("resourceProto")

        addPath         := method(path, paths append(path))
        removePath      := method(path, paths remove(path))

        addSuffix       := method(path, suffixes append(path))
        removeSuffix    := method(path, suffixes remove(path))

        item := method(itemName,
            r := itemOrNil(itemName)
            if(r, return r)
            Exception raise(self type .. " unable to find resource '" .. itemName .. "'")
        )

        itemOrNil := method(itemName,
            //writeln("looking for ", itemName, "\n")
            r := cache at(itemName)
            //if (result , write("found cached ", itemName, "\n"))
            if(r, r, find(itemName))
        )

        find := method(name,
            file := fileFor(name)
            if(file,
                resource := resourceProto clone open(file path)
                cache atPut(name, resource)
                //write("found resource ", name, "\n")
                return resource
            )
            nil
        )

        fileFor := method(name,
            paths foreach(path,
                fullPath := Path with(resourcesPath, path)
                //writeln("resourcesPath = ", resourcesPath)
                suffixes foreach(suffix,
                    fullName := name .. "." .. suffix
                    result := tmpDir setPath(fullPath) at(fullName)
                    //writeln("  searching: ", Path with(fullPath, fullName), " (", if(result, "found", "not found"), ")")
                    if (result, return result)
                )
            )
            nil
        )
    )

    ImageManager := ResourceManager clone do(
        setType("ImageManager")
        addPath("themes/Neos")
        addSuffix("png")
        addSuffix("jpg")
        addSuffix("tiff")
        setResourceProto(Image)
    )

    FontManager := ResourceManager clone do(
        addPath("fonts")
        setType("FontManager")
        addSuffix("ttf")
        setResourceProto(Font)
    )
)
