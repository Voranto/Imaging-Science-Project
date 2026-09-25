import { UniformNoise } from "./UniformNoise";
import {GaussianNoise} from "./GaussianNoise"
import { MultiplicativeUniformNoise } from "./MultiplicativeUniformNoise";
import { MultiplicativeGaussianNoise } from "./MultiplicativeGaussianNoise";
import { ImpulseNoise } from "./ImpulseNoise";
const uniformNoise = new UniformNoise();
const gaussianNoise = new GaussianNoise();
const multiplicativeUniformNoise = new MultiplicativeUniformNoise();
const multiplicativeGaussianNoise = new MultiplicativeGaussianNoise();
const impulseNoise = new ImpulseNoise();
export function applyUniformNoise() {
    uniformNoise.applyNoise();
}
export function applyGaussianNoise() {
    gaussianNoise.applyNoise();
}
export function applyMultiplicativeUniformNoise() {
    multiplicativeUniformNoise.applyNoise();
}
export function applyMultiplicativeGaussianNoise() {
    multiplicativeGaussianNoise.applyNoise();
}
export function applyImpulseNoise() {
    impulseNoise.applyNoise();
}