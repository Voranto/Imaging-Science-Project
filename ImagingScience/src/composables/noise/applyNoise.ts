import { UniformNoise } from "./UniformNoise";
import {GaussianNoise} from "./GaussianNoise"
import { MultiplicativeUniformNoise } from "./MultiplicativeUniformNoise";

const uniformNoise = new UniformNoise();
const gaussianNoise = new GaussianNoise();
const multiplicativeUniformNoise = new MultiplicativeUniformNoise();
export function applyUniformNoise() {
    uniformNoise.applyNoise();
}
export function applyGaussianNoise() {
    gaussianNoise.applyNoise();
}
export function applyMultiplicativeUniformNoise() {
    multiplicativeUniformNoise.applyNoise();
}