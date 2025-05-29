import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon, TimeIcon } from "../../../icons";
import { Link } from "react-router";
import DatePicker from "../date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Checkbox from "../input/Checkbox";


  
export default function Criarbilhetes() {
    const options = [
        { value: "marketing", label: "Marketing" },
        { value: "template", label: "Template" },
        { value: "development", label: "Development" },
    ];
    const handleSelectChange = (value: string) => {
        console.log("Selected value:", value);
    };
        const [isChecked, setIsChecked] = useState(false);
    

    return (
        <div>
            <div className="space-y-6">

                <div>
                    <Label>Tipo de Bilhetes</Label>
                    <Select
                        options={options}
                        placeholder="Selecione uma opção"
                        onChange={handleSelectChange}
                        className="dark:bg-dark-900"
                    />
                </div>
                <div>
                    <Label htmlFor="input">Preco Liquido</Label>
                    <Input type="text" id="input" />
                </div>

                <div>
                    <Label htmlFor="input">Quantidade</Label>
                    <Input type="text" id="input" />
                </div>

                <div>
                    <DatePicker
                        id="date-picker"
                        label="Date Picker Input"
                        placeholder="Select a date"
                        onChange={(dates, currentDateString) => {
                            // Handle your logic
                            console.log({ dates, currentDateString });
                        }}
                    />
                </div>

                <div>
                    <Label htmlFor="tm">Time Picker Input</Label>
                    <div className="relative">
                        <Input
                            type="time"
                            id="tm"
                            name="tm"
                            onChange={(e) => console.log(e.target.value)}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                            <TimeIcon className="size-6" />
                        </span>
                    </div>
                </div>

                 <div>
                    <Label htmlFor="input">Pré-visualização</Label>
                    <Input type="text" id="input" />
                </div>

                <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Gratuito
                        </span>
                </div>
                
                <div className="flex gap-5 butaobilhete">
                     <Button className="butaobilhete" size="md" variant="primary">
                         Publicar
                    </Button>
                </div>
                   
                 

            </div>
        </div>
    );
}
